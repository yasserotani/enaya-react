import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPatientMedicalRecord } from "./api/patientsApi";

// Badge colors
const statusColors = {
  completed: "bg-success-light text-success border-success-border",
  cancelled: "bg-error-light text-error border-error-border",
  pending: "bg-warning-light text-warning border-warning-border",
  in_progress: "bg-primary/10 text-primary border-primary/20",
};

export default function PatientMedicalRecordPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;
    const loadRecord = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchPatientMedicalRecord(patientId, { page: currentPage, per_page: 10 });
        if (isMounted) {
          setData(response.data);
          setMeta(response.meta);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to load medical record"
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadRecord();
    return () => {
      isMounted = false;
    };
  }, [patientId, currentPage]);

  return (
    <div className="mx-auto max-w-4xl py-4">
      {/* Header section with back button */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate("/patients")}
          className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted-light"
        >
          Back to Patients
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Medical Record
        </h1>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {isLoading && !data ? (
        <div className="space-y-4">
          <div className="h-32 w-full animate-pulse rounded-2xl bg-muted-light/60"></div>
          <div className="h-48 w-full animate-pulse rounded-2xl bg-muted-light/60"></div>
          <div className="h-48 w-full animate-pulse rounded-2xl bg-muted-light/60"></div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Patient Info Card */}
          <div className="rounded-2xl border border-border bg-surface px-6 py-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-foreground">Patient Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground/60">Name</p>
                <p className="mt-1 font-medium text-foreground">{data.patient.full_name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground/60">Phone</p>
                <p className="mt-1 font-medium text-foreground">{data.patient.phone}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground/60">Date of Birth</p>
                <p className="mt-1 font-medium text-foreground">
                  {data.patient.date_of_birth
                    ? new Date(data.patient.date_of_birth).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground/60">Gender</p>
                <p className="mt-1 capitalize font-medium text-foreground">{data.patient.gender || "—"}</p>
              </div>
            </div>
          </div>

          {/* Appointment History */}
          <div>
            <h2 className="mb-4 text-lg font-bold text-foreground">Appointment History</h2>
            
            {data.appointments.length === 0 ? (
              <div className="rounded-2xl border border-border bg-surface px-6 py-12 text-center shadow-sm">
                <p className="text-foreground/60">No appointment history yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.appointments.map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => {
                      if (apt.session?.id) {
                        navigate(`/sessions/${apt.session.id}`);
                      }
                    }}
                    className={`rounded-2xl border border-border bg-surface px-6 py-5 shadow-sm transition ${
                      apt.session?.id 
                        ? "cursor-pointer hover:border-primary/40 hover:shadow-md" 
                        : "opacity-90"
                    }`}
                  >
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          {new Date(apt.scheduled_at).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                        <p className="text-sm text-foreground/70">with {apt.doctor?.full_name}</p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          statusColors[apt.session?.status || apt.status] || "bg-muted-light text-foreground"
                        }`}
                      >
                        {(apt.session?.status || apt.status).replace("_", " ")}
                      </span>
                    </div>

                    <div className="border-t border-border pt-4">
                      {!apt.session ? (
                        <p className="text-sm text-foreground/60">No session recorded</p>
                      ) : (
                        <div className="space-y-4">
                          <div className="rounded-xl border border-border/50 bg-background/50 p-4">
                            <div className="mb-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/70">
                              {apt.session.started_at && (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-foreground">Started:</span>
                                  <span>{new Date(apt.session.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              )}
                              {apt.session.ended_at && (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-foreground">Ended:</span>
                                  <span>{new Date(apt.session.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              )}
                            </div>

                            {(apt.session.patient_complaint || apt.session.diagnosis || apt.session.notes) && (
                              <div className="grid gap-4 text-sm sm:grid-cols-2">
                                {apt.session.patient_complaint && (
                                  <div>
                                    <span className="block text-xs font-semibold uppercase tracking-wider text-foreground/60">Complaint</span>
                                    <span className="mt-0.5 block font-medium text-foreground/90">{apt.session.patient_complaint}</span>
                                  </div>
                                )}
                                {apt.session.diagnosis && (
                                  <div>
                                    <span className="block text-xs font-semibold uppercase tracking-wider text-foreground/60">Diagnosis</span>
                                    <span className="mt-0.5 block font-medium text-foreground/90">{apt.session.diagnosis}</span>
                                  </div>
                                )}
                                {apt.session.notes && (
                                  <div className="sm:col-span-2">
                                    <span className="block text-xs font-semibold uppercase tracking-wider text-foreground/60">Notes</span>
                                    <span className="mt-0.5 block text-foreground/80">{apt.session.notes}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {(!apt.session.prescriptions || apt.session.prescriptions.length === 0) ? (
                            <p className="text-sm text-foreground/60">No prescriptions</p>
                          ) : (
                            <div>
                              <p className="mb-2 text-sm font-semibold text-foreground">Prescriptions</p>
                              <ul className="space-y-2">
                                {apt.session.prescriptions.map((px) => (
                                  <li key={px.id} className="rounded-xl border border-border/50 bg-background px-4 py-3 text-sm">
                                    <p className="font-semibold text-foreground">{px.medication_name || "Unknown Medication"}</p>
                                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-foreground/70">
                                      {px.dosage && <span>Dosage: {px.dosage}</span>}
                                      {px.frequency && <span>Frequency: {px.frequency}</span>}
                                      {px.duration_days && <span>Duration: {px.duration_days} days</span>}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && data.appointments.length > 0 && (
            <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-6 py-4 shadow-sm">
              <p className="text-sm text-foreground/60">
                Page {meta.current_page} of {meta.last_page}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={meta.current_page <= 1 || isLoading}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl border border-border px-3 py-1.5 text-sm font-medium text-foreground/80 transition hover:bg-muted-light disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={meta.current_page >= meta.last_page || isLoading}
                  onClick={() => setCurrentPage((p) => Math.min(meta.last_page, p + 1))}
                  className="rounded-xl border border-border px-3 py-1.5 text-sm font-medium text-foreground/80 transition hover:bg-muted-light disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
