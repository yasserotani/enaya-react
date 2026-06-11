import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { deleteUser, fetchUsers } from "./api/usersApi";
import CreateUserModal from "./components/CreateUserModal";
import DeleteUserConfirm from "./components/DeleteUserConfirm";
import EditUserModal from "./components/EditUserModal";

const ROLE_FILTERS = [
  { value: "", label: "All roles" },
  { value: "doctor", label: "Doctor" },
  { value: "receptionist", label: "Receptionist" },
  { value: "patient", label: "Patient" },
];

function getRoleName(role) {
  return typeof role === "string" ? role : role?.name ?? "";
}

function isPatientUser(user) {
  return (user.roles ?? []).some((role) => getRoleName(role) === "patient");
}

function RoleBadge({ role }) {
  const name = getRoleName(role);
  const styles = {
    doctor: "bg-primary/15 text-primary",
    receptionist: "bg-accent/15 text-accent",
    patient: "bg-warning/15 text-warning",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[name] || "bg-muted-light text-foreground/70"}`}
    >
      {name}
    </span>
  );
}

export default function UsersPage() {
  const navigate = useNavigate();
  const { fetchUser, user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setListError(null);

    try {
      const params = { page: currentPage };
      if (debouncedSearch) params.search = debouncedSearch;
      if (roleFilter) params.role = roleFilter;

      const result = await fetchUsers(params);
      setUsers(result.data ?? []);
      setCurrentPage(result.current_page ?? 1);
      setLastPage(result.last_page ?? 1);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load users";
      setListError(message);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, roleFilter]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleRoleChange = (value) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleUserCreated = () => {
    if (currentPage === 1) {
      void loadUsers();
    } else {
      setCurrentPage(1);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);

      if (users.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        void loadUsers();
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete user";
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl py-4">
      <div className="rounded-2xl border border-border bg-surface shadow-lg">
        <div className="flex flex-col gap-4 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Users
            </h1>
            <p className="mt-1 text-sm text-foreground/60">
              Manage doctors, receptionists, and patients
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-secondary"
          >
            Add user
          </button>
        </div>

        <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row">
          <div className="flex-1">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-foreground/30 focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 sm:w-48"
          >
            {ROLE_FILTERS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {listError && (
          <div className="mx-6 mt-4 rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
            {listError}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted-light/50 text-xs font-semibold uppercase tracking-wide text-foreground/50">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Roles</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-foreground/50"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-foreground/50"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isSelf = currentUser?.id === user.id;
                  const isPatient = isPatientUser(user);

                  return (
                    <tr
                      key={user.id}
                      onClick={() => {
                        if (isPatient) {
                          navigate(`/patients/user/${user.id}`, {
                            state: {
                              email: user.email,
                              name: user.name,
                            },
                          });
                        }
                      }}
                      className={`border-b border-border/70 transition hover:bg-muted-light/30 ${
                        isPatient ? "cursor-pointer" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        {user.name}
                        {isPatient && (
                          <span className="ml-2 text-xs font-normal text-foreground/40">
                            View profile →
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-foreground/70">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {(user.roles ?? []).map((role) => (
                            <RoleBadge
                              key={typeof role === "string" ? role : role.id}
                              role={role}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            title="Edit user"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditTarget(user);
                            }}
                            className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/10"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={isSelf}
                            title={
                              isSelf
                                ? "You cannot delete your own account"
                                : "Delete user"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteError(null);
                              setDeleteTarget(user);
                            }}
                            className="rounded-lg px-3 py-1.5 text-sm font-medium text-error transition hover:bg-error-light disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {lastPage > 1 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <p className="text-sm text-foreground/60">
              Page {currentPage} of {lastPage}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => setCurrentPage((page) => page - 1)}
                className="rounded-xl border border-border px-3 py-1.5 text-sm font-medium text-foreground/80 transition hover:bg-muted-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= lastPage || isLoading}
                onClick={() => setCurrentPage((page) => page + 1)}
                className="rounded-xl border border-border px-3 py-1.5 text-sm font-medium text-foreground/80 transition hover:bg-muted-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleUserCreated}
      />

      <EditUserModal
        open={Boolean(editTarget)}
        user={editTarget}
        onClose={() => setEditTarget(null)}
        onUpdated={() => void loadUsers()}
      />

      <DeleteUserConfirm
        open={Boolean(deleteTarget)}
        user={deleteTarget}
        isDeleting={isDeleting}
        error={deleteError}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
