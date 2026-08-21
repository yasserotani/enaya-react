import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";

import { fetchDoctors } from "../doctors/api/doctorsApi";
import {
  confirmAppointment,
  fetchAppointmentById,
  markAppointmentArrived,
  markAppointmentNoShow,
} from "./api/appointmentsApi";
import AppointmentStatusBadge from "./components/AppointmentStatusBadge";
import CancelAppointmentModal from "./components/CancelAppointmentModal";
import EditAppointmentModal from "./components/EditAppointmentModal";
import RescheduleAppointmentModal from "./components/RescheduleAppointmentModal";
import {
  canCancel,
  canConfirm,
  canEdit,
  canMarkArrived,
  canMarkNoShow,
  canReschedule,
  formatStatusLabel,
  getDoctorName,
  getPatientName,
  normalizeStatus,
} from "./utils/appointmentHelpers";

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/60 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm font-medium text-foreground/60">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value ?? "—"}</dd>
    </div>
  );
}

function SessionCard({ session }) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">
          Session #{session.id}
        </p>
        <span className="text-xs font-medium capitalize text-foreground/60">
          {formatStatusLabel(session.status)}
        </span>
      </div>
      {session.started_at && (
        <p className="mt-2 text-sm text-foreground/70">
          {dayjs(session.started_at).format("MMM D, YYYY h:mm A")}
          {session.ended_at
            ? ` – ${dayjs(session.ended_at).format("h:mm A")}`
            : ""}
        </p>
      )}
      {session.patient_complaint && (
        <p className="mt-2 text-sm text-foreground/70">
          <span className="font-medium text-foreground/80">Complaint:</span>{" "}
          {session.patient_complaint}
        </p>
      )}
      {session.diagnosis && (
        <p className="mt-1 text-sm text-foreground/70">
          <span className="font-medium text-foreground/80">Diagnosis:</span>{" "}
          {session.diagnosis}
        </p>
      )}
      {session.notes && (
        <p className="mt-1 text-sm text-foreground/70">
          <span className="font-medium text-foreground/80">Notes:</span>{" "}
          {session.notes}
        </p>
      )}
    </div>
  );
}

export default function AppointmentDetailPage() {
  const { appointmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage ?? null,
  );
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadDoctors() {
      try {
        const result = await fetchDoctors({ per_page: 100 });
        if (!cancelled) setDoctors(result.data ?? []);
      } catch {
        if (!cancelled) setDoctors([]);
      }
    }

    void loadDoctors();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!location.state?.successMessage) return;

    setSuccessMessage(location.state.successMessage);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const loadAppointment = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchAppointmentById(appointmentId);
      setAppointment(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load appointment details",
      );
      setAppointment(null);
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    void loadAppointment();
  }, [loadAppointment]);

  const runAction = async (action, message) => {
    setIsActionLoading(true);
    setActionError(null);

    try {
      await action();
      setSuccessMessage(message);
      await loadAppointment();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update appointment",
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <p className="text-center text-sm text-foreground/50">
          Loading appointment details...
        </p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <Link
          to="/appointments"
          className="mb-4 inline-flex text-sm font-medium text-primary hover:text-secondary"
        >
          ← Back to appointments
        </Link>
        <div className="rounded-2xl border border-error-border bg-error-light px-6 py-8 text-center text-sm text-error">
          {error || "Appointment not found"}
        </div>
      </div>
    );
  }

  const sessions = appointment.sessions ?? appointment.appointment_sessions ?? [];
  const status = normalizeStatus(appointment.status);

  return (
    <div className="mx-auto max-w-3xl py-4">
      <Link
        to="/appointments"
        className="mb-4 inline-flex text-sm font-medium text-primary transition hover:text-secondary"
      >
        ← Back to appointments
      </Link>

      <div className="rounded-2xl border border-border bg-surface shadow-lg">
        <div className="border-b border-border px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                Appointment #{appointment.id}
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {getPatientName(appointment)}
              </h1>
              <p className="mt-1 text-sm text-foreground/60">
                {appointment.scheduled_at
                  ? dayjs(appointment.scheduled_at).format(
                      "dddd, MMM D, YYYY · h:mm A",
                    )
                  : "—"}
              </p>
            </div>
            <AppointmentStatusBadge status={appointment.status} />
          </div>
        </div>

        {successMessage && (
          <div className="mx-6 mt-4 rounded-xl border border-success-border bg-success-light px-4 py-3 text-sm text-success">
            {successMessage}
          </div>
        )}

        {actionError && (
          <div className="mx-6 mt-4 rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
            {actionError}
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-b border-border px-6 py-4">
          {canEdit(status) && (
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => setShowEditModal(true)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-muted-light/60 disabled:opacity-50"
            >
              Edit
            </button>
          )}

          {canConfirm(status) && (
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() =>
                void runAction(
                  () => confirmAppointment(appointment.id),
                  "Appointment confirmed.",
                )
              }
              className="rounded-xl bg-success px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-50"
            >
              Confirm
            </button>
          )}

          {canMarkArrived(status) && (
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() =>
                void runAction(
                  () => markAppointmentArrived(appointment.id),
                  "Patient marked as arrived.",
                )
              }
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-background transition hover:bg-secondary disabled:opacity-50"
            >
              Mark arrived
            </button>
          )}

          {canReschedule(status) && (
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => setShowRescheduleModal(true)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-muted-light/60 disabled:opacity-50"
            >
              Reschedule
            </button>
          )}

          {canMarkNoShow(status) && (
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() =>
                void runAction(
                  () => markAppointmentNoShow(appointment.id),
                  "Marked as no-show.",
                )
              }
              className="rounded-xl border border-warning-border bg-warning-light px-4 py-2 text-sm font-semibold text-warning transition hover:opacity-90 disabled:opacity-50"
            >
              Mark no-show
            </button>
          )}

          {canCancel(status) && (
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => setShowCancelModal(true)}
              className="rounded-xl border border-error-border bg-error-light px-4 py-2 text-sm font-semibold text-error transition hover:opacity-90 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="grid gap-6 px-6 py-5 md:grid-cols-2">
          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-secondary/90">
              Patient
            </h2>
            <dl>
              <DetailRow label="Name" value={getPatientName(appointment)} />
              <DetailRow
                label="Phone"
                value={appointment.patient?.phone}
              />
            </dl>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-secondary/90">
              Visit
            </h2>
            <dl>
              <DetailRow label="Doctor" value={getDoctorName(appointment)} />
              <DetailRow
                label="Visit reason"
                value={appointment.visit_reason}
              />
              <DetailRow label="Notes" value={appointment.notes} />
            </dl>
          </section>
        </div>

        {sessions.length > 0 && (
          <div className="border-t border-border px-6 py-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-secondary/90">
              Sessions
            </h2>
            <div className="space-y-3">
              {sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        )}
      </div>

      <EditAppointmentModal
        open={showEditModal}
        appointment={appointment}
        doctors={doctors}
        onClose={() => setShowEditModal(false)}
        onUpdated={() => {
          setShowEditModal(false);
          setSuccessMessage("Appointment updated successfully.");
          void loadAppointment();
        }}
      />

      <CancelAppointmentModal
        open={showCancelModal}
        appointment={appointment}
        onClose={() => setShowCancelModal(false)}
        onCanceled={() => {
          setShowCancelModal(false);
          setSuccessMessage("Appointment cancelled successfully.");
          void loadAppointment();
        }}
      />

      <RescheduleAppointmentModal
        open={showRescheduleModal}
        appointment={appointment}
        onClose={() => setShowRescheduleModal(false)}
        onRescheduled={() => {
          setShowRescheduleModal(false);
          setSuccessMessage("Appointment rescheduled successfully.");
          void loadAppointment();
        }}
      />
    </div>
  );
}
