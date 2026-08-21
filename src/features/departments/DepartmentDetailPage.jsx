import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { deleteDepartment, fetchDepartmentById } from "./api/departmentsApi";
import EditDepartmentModal from "./components/EditDepartmentModal";
import DeleteDepartmentConfirm from "./components/DeleteDepartmentConfirm";

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/60 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm font-medium text-foreground/60">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value ?? "—"}</dd>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString();
}

export default function DepartmentDetailPage() {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [department, setDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage ?? null,
  );

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    if (location.state?.editMode) {
      setEditOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state?.editMode, location.pathname, navigate]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchDepartmentById(departmentId);
        if (!cancelled) setDepartment(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              "Failed to load department details",
          );
          setDepartment(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [departmentId]);



  const reloadDepartment = async () => {
    try {
      const data = await fetchDepartmentById(departmentId);
      setDepartment(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load department details",
      );
    }
  };

  useEffect(() => {
    if (!location.state?.successMessage) return;

    setSuccessMessage(location.state.successMessage);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const handleDeleteConfirm = async () => {
    if (!department) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteDepartment(department.id);
      setDeleteOpen(false);
      navigate("/departments", {
        replace: true,
        state: {
          successMessage: `Department "${department.name}" deleted successfully.`,
        },
      });
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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <p className="text-center text-sm text-foreground/50">
          Loading department details...
        </p>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <Link
          to="/departments"
          className="mb-4 inline-flex text-sm font-medium text-primary hover:text-secondary"
        >
          ← Back to departments
        </Link>
        <div className="rounded-2xl border border-error-border bg-error-light px-6 py-8 text-center text-sm text-error">
          {error || "Department not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-4">
      <Link
        to="/departments"
        className="mb-4 inline-flex text-sm font-medium text-primary transition hover:text-secondary"
      >
        ← Back to departments
      </Link>

      {successMessage && (
        <div className="mb-4 rounded-xl border border-success-border bg-success-light px-4 py-3 text-sm text-success">
          {successMessage}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface shadow-lg">
        <div className="border-b border-border px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary">
                {department.name?.charAt(0)?.toUpperCase() || "D"}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                  Department
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  {department.name}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 px-6 py-5 md:grid-cols-2">
          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-secondary/90">
              Department info
            </h2>
            <dl>
              <DetailRow label="Department name" value={department.name} />
              <DetailRow label="Department ID" value={department.id} />
            </dl>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-secondary/90">
              Record
            </h2>
            <dl>
              <DetailRow
                label="Created at"
                value={formatDate(department.created_at)}
              />
              {department.updated_at && (
                <DetailRow
                  label="Updated at"
                  value={formatDate(department.updated_at)}
                />
              )}
            </dl>
          </section>
        </div>

        <div className="flex flex-wrap justify-between gap-2 border-t border-border px-6 py-4">
          <div>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-primary m-2 transition hover:bg-muted-light"
            >
              Edit department
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setDeleteError(null);
              setDeleteOpen(true);
            }}
            className="rounded-xl bg-error/80 h-10 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-50"
          >
            Delete department
          </button>
        </div>
      </div>

      <EditDepartmentModal
        open={editOpen}
        department={department}
        onClose={() => setEditOpen(false)}
        onUpdated={() => {
          void reloadDepartment();
          setSuccessMessage("Department updated successfully.");
        }}
      />

      <DeleteDepartmentConfirm
        open={deleteOpen}
        department={department}
        isDeleting={isDeleting}
        error={deleteError}
        onClose={() => {
          if (!isDeleting) setDeleteOpen(false);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
