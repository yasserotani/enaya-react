import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  fetchDepartments,
  deleteDepartment,
} from "./api/departmentsApi";
import DeleteDepartmentConfirm from "./components/DeleteDepartmentConfirm";

export default function DepartmentPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage ?? null,
  );

  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    if (!location.state?.successMessage) return;

    setSuccessMessage(location.state.successMessage);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const loadDepartments = useCallback(async () => {
    setIsLoading(true);
    setListError(null);

    try {
      const params = { page: currentPage };

      if (debouncedSearch) params.search = debouncedSearch;

      const result = await fetchDepartments(params);

      setDepartments(result.data ?? []);
      setCurrentPage(result.meta?.current_page ?? 1);
      setLastPage(result.meta?.last_page ?? 1);
    } catch (err) {
      setListError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load departments",
      );
      setDepartments([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    void loadDepartments();
  }, [loadDepartments]);

  const handleDeleteClick = (department, e) => {
    e.stopPropagation();
    setDepartmentToDelete(department);
    setDeleteError(null);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!departmentToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteDepartment(departmentToDelete.id);
      setDeleteOpen(false);
      setDepartmentToDelete(null);
      setSuccessMessage(`Department "${departmentToDelete.name}" deleted successfully.`);
      await loadDepartments();
    } catch (err) {
      setDeleteError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to delete department",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Departments</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Browse and manage hospital departments.
          </p>
        </div>

        <Link
          to="/departments/new"
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-secondary"
        >
          Add department
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-4">
        <div className="min-w-[220px] flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by department name..."
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/35 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>
      </div>

      {successMessage && (
        <div className="mx-6 mt-4 rounded-xl border border-success-border bg-success-light px-4 py-3 text-sm text-success">
          {successMessage}
        </div>
      )}

      {listError && (
        <div className="mx-6 mt-4 rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
          {listError}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {isLoading ? (
          <p className="py-12 text-center text-sm text-foreground/50">
            Loading departments...
          </p>
        ) : departments.length === 0 ? (
          <p className="py-12 text-center text-sm text-foreground/50">
            No departments found
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {departments.map((department) => (
              <article
                key={department.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/departments/${department.id}`)}
                className="group cursor-pointer rounded-2xl border border-border bg-surface/80 p-4 shadow-sm transition hover:border-primary/60 hover:bg-surface hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                      {department.name?.charAt(0)?.toUpperCase() || "D"}
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">
                        {department.name}
                      </h2>
                      <p className="text-xs text-foreground/60">
                        Department
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-foreground/55">Department ID</span>
                    <span className="font-mono text-[11px] text-foreground/85">
                      {department.id}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/departments/${department.id}`);
                    }}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:bg-muted-light hover:text-foreground"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/departments/${department.id}`, { state: { editMode: true } });
                    }}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:bg-muted-light hover:text-foreground"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClick(department, e)}
                    className="flex-1 rounded-lg border border-error/30 bg-error/5 px-3 py-1.5 text-xs font-medium text-error transition hover:bg-error/10"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {lastPage > 1 && (
          <div className="mt-6 flex items-center justify-between">
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

      <DeleteDepartmentConfirm
        open={deleteOpen}
        department={departmentToDelete}
        isDeleting={isDeleting}
        error={deleteError}
        onClose={() => {
          if (!isDeleting) {
            setDeleteOpen(false);
            setDepartmentToDelete(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
