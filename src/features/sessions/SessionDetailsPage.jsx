import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import dayjs from "dayjs";
import { fetchSessionById } from "./api/sessionsApi";

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/60 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm font-medium text-foreground/60">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value ?? "—"}</dd>
    </div>
  );
}

export default function SessionDetailsPage() {
  const { sessionId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadSession = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchSessionById(sessionId);
        if (isMounted) setSessionData(data);
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to load session details"
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadSession();
    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <p className="text-center text-sm text-foreground/50">Loading session details...</p>
      </div>
    );
  }

  if (error || !sessionData || !sessionData.session) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <button onClick={() => window.history.back()} className="mb-4 inline-flex text-sm font-medium text-primary hover:text-secondary">
          ← Back
        </button>
        <div className="rounded-2xl border border-error-border bg-error-light px-6 py-8 text-center text-sm text-error">
          {error || "Session not found"}
        </div>
      </div>
    );
  }

  const { session, appointment } = sessionData;

  return (
    <div className="mx-auto max-w-3xl py-4">
      <button onClick={() => window.history.back()} className="mb-4 inline-flex text-sm font-medium text-primary transition hover:text-secondary">
        ← Back
      </button>

      <div className="rounded-2xl border border-border bg-surface shadow-lg">
        <div className="border-b border-border px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                Session #{session.id}
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Session Details
              </h1>
              {appointment && (
                <p className="mt-1 text-sm text-foreground/60">
                  Appointment #{appointment.id} • {appointment.patient?.full_name}
                </p>
              )}
            </div>
          </div>
        </div>

        {appointment && (
          <div className="border-b border-border bg-muted-light/20 px-6 py-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-secondary/90">
              Appointment Context
            </h2>
            <div className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 md:grid-cols-3">
              <div>
                <span className="block text-xs font-semibold text-foreground/60">Patient</span>
                <span className="block font-medium text-foreground">{appointment.patient?.full_name || "—"}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-foreground/60">Doctor</span>
                <span className="block font-medium text-foreground">{appointment.doctor?.full_name || "—"}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-foreground/60">Scheduled</span>
                <span className="block font-medium text-foreground">
                  {appointment.scheduled_at ? dayjs(appointment.scheduled_at).format("MMM D, YYYY h:mm A") : "—"}
                </span>
              </div>
              <div className="sm:col-span-2 md:col-span-3">
                <span className="block text-xs font-semibold text-foreground/60">Visit Reason</span>
                <span className="block text-foreground/90">{appointment.visit_reason || "—"}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 px-6 py-5 md:grid-cols-2">
          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-secondary/90">
              Timing
            </h2>
            <dl>
              <DetailRow
                label="Started At"
                value={session.started_at ? dayjs(session.started_at).format("MMM D, YYYY h:mm A") : "—"}
              />
              <DetailRow
                label="Ended At"
                value={session.ended_at ? dayjs(session.ended_at).format("MMM D, YYYY h:mm A") : "—"}
              />
            </dl>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-secondary/90">
              Clinical Notes
            </h2>
            <dl>
              <DetailRow label="Complaint" value={session.patient_complaint} />
              <DetailRow label="Diagnosis" value={session.diagnosis} />
              <DetailRow label="Notes" value={session.notes} />
            </dl>
          </section>
        </div>

        {session.prescriptions && session.prescriptions.length > 0 && (
          <div className="border-t border-border px-6 py-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-secondary/90">
              Prescriptions
            </h2>
            <div className="space-y-3">
              {session.prescriptions.map((px) => (
                <div key={px.id} className="rounded-xl border border-border/50 bg-background px-4 py-3 text-sm">
                  <p className="font-semibold text-foreground">{px.medication_name || "Unknown Medication"}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-foreground/70">
                    {px.dosage && <span>Dosage: {px.dosage}</span>}
                    {px.frequency && <span>Frequency: {px.frequency}</span>}
                    {px.duration_days && <span>Duration: {px.duration_days} days</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
