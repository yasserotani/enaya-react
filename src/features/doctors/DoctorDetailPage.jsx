import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { deleteDoctor, fetchDoctorById, restoreDoctor } from "./api/doctorsApi";
import EditDoctorModal from "./components/EditDoctorModal";
import DeleteDoctorConfirm from "./components/DeleteDoctorConfirm";
import ResetPasswordModal from "./components/ResetPasswordModal";
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

function formatGender(gender) {
  if (!gender) return null;
  return gender.charAt(0).toUpperCase() + gender.slice(1);
}

function formatWorkingHours(start, end) {
  if (!start && !end) return null;
  if (start && end) return `${start} – ${end}`;
  return start || end;
}

function getDoctorName(doctor) {
  return doctor.full_name ?? doctor.name ?? "Doctor";
}

function getInitials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function DoctorDetailPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage ?? null,
  );

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [actionError, setActionError] = useState(null);
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchDoctorById(doctorId);
        if (!cancelled) setDoctor(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              "Failed to load doctor details",
          );
          setDoctor(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  const reloadDoctor = async () => {
    try {
      const data = await fetchDoctorById(doctorId);
      setDoctor(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load doctor details",
      );
    }
  };

  useEffect(() => {
    if (!location.state?.successMessage) return;

    setSuccessMessage(location.state.successMessage);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const handleDeleteConfirm = async () => {
    if (!doctor) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteDoctor(doctor.id);
      setDeleteOpen(false);
      navigate("/doctors", {
        replace: true,
        state: {
          successMessage: `Doctor "${getDoctorName(doctor)}" deleted successfully.`,
        },
      });
    } catch (err) {
      setDeleteError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to delete doctor",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async () => {
    if (!doctor) return;

    setIsRestoring(true);
    setActionError(null);

    try {
      const result = await restoreDoctor(doctor.id);
      setDoctor(result.data ?? result);
      setSuccessMessage(
        `Doctor "${getDoctorName(doctor)}" restored successfully.`,
      );
      // navigate("/doctors");
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to restore doctor",
      );
    } finally {
      setIsRestoring(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <p className="text-center text-sm text-foreground/50">
          Loading doctor details...
        </p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <Link
          to="/doctors"
          className="mb-4 inline-flex text-sm font-medium text-primary hover:text-secondary"
        >
          ← Back to doctors
        </Link>
        <div className="rounded-2xl border border-error-border bg-error-light px-6 py-8 text-center text-sm text-error">
          {error || "Doctor not found"}
        </div>
      </div>
    );
  }

  const name = getDoctorName(doctor);
  const departmentName =
    doctor.department?.name ?? doctor.department_name ?? null;
  const isDeleted = Boolean(doctor.deleted_at);

  return (
    <div className="mx-auto max-w-3xl py-4">
      <Link
        to="/doctors"
        className="mb-4 inline-flex text-sm font-medium text-primary transition hover:text-secondary"
      >
        ← Back to doctors
      </Link>

      {successMessage && (
        <div className="mb-4 rounded-xl border border-success-border bg-success-light px-4 py-3 text-sm text-success">
          {successMessage}
        </div>
      )}

      {actionError && (
        <div className="mb-4 rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
          {actionError}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface shadow-lg">
        <div className="border-b border-border px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary">
                {getInitials(name)}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                  Doctor
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  {name}
                </h1>
                <p className="mt-1 text-sm text-foreground/60">
                  {doctor.specialty}
                  {departmentName ? ` · ${departmentName}` : ""}
                </p>
              </div>
            </div>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                isDeleted
                  ? "bg-error-light text-error"
                  : "bg-success-light text-success"
              }`}
            >
              {isDeleted ? "Inactive" : "Active"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 px-6 py-5 md:grid-cols-2">
          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-secondary/90">
              Personal info
            </h2>
            <dl>
              <DetailRow label="Full name" value={name} />
              <DetailRow
                label="Date of birth"
                value={formatDate(doctor.date_of_birth)}
              />
              <DetailRow label="Gender" value={formatGender(doctor.gender)} />
              <DetailRow label="Phone" value={doctor.phone} />
            </dl>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-secondary/90">
              Professional info
            </h2>
            <dl>
              <DetailRow label="Specialty" value={doctor.specialty} />
              <DetailRow label="Department" value={departmentName} />
              <DetailRow
                label="Working hours"
                value={formatWorkingHours(
                  doctor.working_hours_start,
                  doctor.working_hours_end,
                )}
              />
            </dl>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-secondary/90">
              Account
            </h2>
            <dl>
              <DetailRow label="User ID" value={doctor.user?.id || "—"} />
              <DetailRow
                label="Email"
                value={doctor.email || doctor.user?.email || "—"}
              />{" "}
            </dl>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-secondary/90">
              Record
            </h2>
            <dl>
              <DetailRow label="Doctor ID" value={doctor.id} />
              <DetailRow
                label="Registered"
                value={formatDate(doctor.created_at)}
              />
              {isDeleted && (
                <DetailRow
                  label="Deleted at"
                  value={formatDate(doctor.deleted_at)}
                />
              )}
            </dl>
          </section>
        </div>

        <div className="flex flex-wrap justify-between gap-2 border-t border-border px-6 py-4">
          {!isDeleted ? (
            <>
              <div>
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-primary m-2 transition hover:bg-muted-light"
                >
                  Edit doctor
                </button>
                <button
                  type="button"
                  onClick={() => setResetPasswordOpen(true)}
                  className="rounded-xl border border-primary/40 px-4 py-2.5 text-sm font-medium text-foreground/80 transition hover:bg-primary/10"
                >
                  Reset password
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
                Delete doctor
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => void handleRestore()}
              disabled={isRestoring}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isRestoring ? "Restoring..." : "Restore doctor"}
            </button>
          )}
        </div>
      </div>

      <EditDoctorModal
        open={editOpen}
        doctor={doctor}
        onClose={() => setEditOpen(false)}
        onUpdated={() => {
          void reloadDoctor();
          setSuccessMessage("Doctor updated successfully.");
        }}
      />

      <DeleteDoctorConfirm
        open={deleteOpen}
        doctor={doctor}
        isDeleting={isDeleting}
        error={deleteError}
        onClose={() => {
          if (!isDeleting) setDeleteOpen(false);
        }}
        onConfirm={handleDeleteConfirm}
      />

      <ResetPasswordModal
        open={resetPasswordOpen}
        doctor={doctor}
        onClose={() => setResetPasswordOpen(false)}
        onReset={() => setSuccessMessage("Password reset successfully.")}
      />
    </div>
  );
}
