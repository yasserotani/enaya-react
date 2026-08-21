import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom"; // Removed useLocation
import { fetchPatientById, fetchPatientByUserId } from "./api/patientsApi";

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
  const d = new Date(date);
  return d.toLocaleDateString();
}

export default function PatientDetailPage() {
  const { userId, patientId } = useParams();

  // We no longer need location.state because the API provides the email and name
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const data = userId
          ? await fetchPatientByUserId(userId)
          : await fetchPatientById(patientId);

        if (!cancelled) setPatient(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              "Failed to load patient details",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [userId, patientId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <p className="text-center text-sm text-foreground/50">
          Loading patient details...
        </p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <Link
          to="/patients"
          className="mb-4 inline-flex text-sm font-medium text-primary hover:text-secondary"
        >
          ← Back to patients
        </Link>
        <div className="rounded-2xl border border-error-border bg-error-light px-6 py-8 text-center text-sm text-error">
          {error || "Patient not found"}
        </div>
      </div>
    );
  }

  const hasAccount = Boolean(patient.user_id);

  return (
    <div className="mx-auto max-w-3xl py-4">
      <Link
        to="/patients"
        className="mb-4 inline-flex text-sm font-medium text-primary transition hover:text-secondary"
      >
        ← Back to patients
      </Link>

      <div className="rounded-2xl border border-border bg-surface shadow-lg">
        <div className="border-b border-border px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                Patient
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {patient.full_name}
              </h1>
            </div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                patient.profile_completed
                  ? "bg-success-light text-success"
                  : "bg-warning-light text-warning"
              }`}
            >
              {patient.profile_completed
                ? "Profile complete"
                : "Profile incomplete"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 px-6 py-5 md:grid-cols-2">
          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-secondary/90">
              Personal info
            </h2>
            <dl>
              <DetailRow label="Full name" value={patient.full_name} />
              <DetailRow
                label="Date of birth"
                value={formatDate(patient.date_of_birth)}
              />
              <DetailRow
                label="Gender"
                value={
                  patient.gender
                    ? patient.gender.charAt(0).toUpperCase() +
                      patient.gender.slice(1)
                    : null
                }
              />
              <DetailRow label="Phone" value={patient.phone} />
            </dl>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-secondary/90">
              Contact & work
            </h2>
            <dl>
              <DetailRow label="Address" value={patient.address} />
              <DetailRow label="Job" value={patient.job} />
              <DetailRow
                label="Emergency Contact"
                value={patient.emergency_contact}
              />
            </dl>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-secondary/90">
              App account
            </h2>
            <dl>
              <DetailRow
                label="Account status"
                value={hasAccount ? "Linked" : "Walk-in (no account)"}
              />
              {hasAccount && (
                <>
                  {/* Now we fetch these safely directly from the patient object! */}
                  <DetailRow
                    label="Account name"
                    value={patient.account_name || "—"}
                  />
                  <DetailRow label="Email" value={patient.email || "—"} />
                  <DetailRow label="Userid" value={patient.user_id || "—"} />
                </>
              )}
            </dl>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-secondary/90">
              Record
            </h2>
            <dl>
              <DetailRow label="Patient ID" value={patient.id} />
              <DetailRow
                label="Registered"
                value={formatDate(patient.created_at)}
              />
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
