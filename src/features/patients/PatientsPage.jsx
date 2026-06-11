import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchPatients, deletePatient } from "./api/patientsApi";
import EditPatientModal from "./components/EditPatientModal";
import DeletePatientConfirm from "./components/DeletePatientConfirm";

function ProfileStatusBadge({ completed }) {
  return (
    <span
      title={completed ? "Profile complete" : "Profile incomplete"}
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
        completed
          ? "bg-success-light text-success"
          : "bg-warning-light text-warning"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          completed ? "bg-success" : "bg-warning"
        }`}
      />
      {completed ? "Complete" : "Incomplete"}
    </span>
  );
}

export default function PatientsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage ?? null,
  );
  const [patients, setPatients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
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

  const loadPatients = useCallback(async () => {
    setIsLoading(true);
    setListError(null);

    try {
      const params = { page: currentPage };
      if (debouncedSearch) params.search = debouncedSearch;
      if (genderFilter) params.gender = genderFilter;
      if (accountFilter) params.has_account = accountFilter;

      const result = await fetchPatients(params);
      setPatients(result.data ?? []);
      setCurrentPage(result.current_page ?? 1);
      setLastPage(result.last_page ?? 1);
    } catch (err) {
      setListError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load patients",
      );
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, genderFilter, accountFilter]);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deletePatient(deleteTarget.id);
      setDeleteTarget(null);
      setSuccessMessage(`Patient "${deleteTarget.full_name}" deleted successfully.`);

      if (patients.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        void loadPatients();
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete patient";
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (patient) => {
    setEditTarget(patient);
  };

  return (
    <div className="mx-auto max-w-6xl py-4">
      <div className="rounded-2xl border border-border bg-surface shadow-lg">
        <div className="flex flex-col gap-4 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Patients
            </h1>
            <p className="mt-1 text-sm text-foreground/60">
              All registered walk-in and app-linked patients
            </p>
          </div>
          <Link
            to="/patients/new"
            className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-background transition hover:bg-secondary"
          >
            Add patient
          </Link>
        </div>

        <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row">
          <div className="flex-1">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-foreground/30 focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </div>
          <select
            value={genderFilter}
            onChange={(e) =>
              handleFilterChange(setGenderFilter)(e.target.value)
            }
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 sm:w-40"
          >
            <option value="">All genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <select
            value={accountFilter}
            onChange={(e) =>
              handleFilterChange(setAccountFilter)(e.target.value)
            }
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 sm:w-44"
          >
            <option value="">All patients</option>
            <option value="true">With app account</option>
            <option value="false">Walk-in only</option>
          </select>
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

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted-light/50 text-xs font-semibold uppercase tracking-wide text-foreground/50">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Gender</th>
                <th className="px-6 py-3">Profile</th>
                <th className="px-6 py-3">Account</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-foreground/50"
                  >
                    Loading patients...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-foreground/50"
                  >
                    No patients found
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-border/70 transition hover:bg-muted-light/30"
                  >
                    <td
                      className="px-6 py-4 font-medium text-foreground cursor-pointer"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      {patient.full_name}
                    </td>
                    <td
                      className="px-6 py-4 text-foreground/70 cursor-pointer"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      {patient.phone}
                    </td>
                    <td
                      className="px-6 py-4 capitalize text-foreground/70 cursor-pointer"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      {patient.gender || "—"}
                    </td>
                    <td
                      className="px-6 py-4 cursor-pointer"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      <ProfileStatusBadge
                        completed={patient.profile_completed}
                      />
                    </td>
                    <td
                      className="px-6 py-4 text-foreground/70 cursor-pointer"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      {patient.user_id ? "App account" : "Walk-in"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          title="Edit patient"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(patient);
                          }}
                          className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/10"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          title="Delete patient"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteError(null);
                            setDeleteTarget(patient);
                          }}
                          className="rounded-lg px-3 py-1.5 text-sm font-medium text-error transition hover:bg-error-light"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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

      <EditPatientModal
        open={Boolean(editTarget)}
        patient={editTarget}
        onClose={() => setEditTarget(null)}
        onUpdated={() => void loadPatients()}
      />

      <DeletePatientConfirm
        open={Boolean(deleteTarget)}
        patient={deleteTarget}
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
