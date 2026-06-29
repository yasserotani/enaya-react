import { useEffect, useState } from "react";
import { cancelAppointment } from "../api/appointmentsApi";
import { getPatientName } from "../utils/appointmentHelpers";
import { parseApiErrors } from "../../../utils/parseApiErrors";

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15";

export default function CancelAppointmentModal({
  open,
  appointment,
  onClose,
  onCanceled,
}) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setReason("");
      setError(null);
    }
  }, [open]);

  if (!open || !appointment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await cancelAppointment(appointment.id, { reason: reason.trim() });
      onCanceled?.();
      onClose();
    } catch (err) {
      const errors = parseApiErrors(err);
      setError(errors.general?.[0] || "Failed to cancel appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-background/40 backdrop-blur-md"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-lg font-semibold text-foreground">
              Cancel appointment
            </h2>
            <p className="mt-1 text-sm text-foreground/60">
              Cancel appointment for {getPatientName(appointment)}?
            </p>
          </div>

          <div className="space-y-4 px-6 py-5">
            {error && (
              <div className="rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="cancel-reason"
                className="block text-sm font-medium text-foreground/75"
              >
                Reason
              </label>
              <textarea
                id="cancel-reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why is this appointment being cancelled?"
                className={inputClassName}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground/70 transition hover:bg-muted-light/60 disabled:opacity-50"
            >
              Keep appointment
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-error px-4 py-2.5 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? "Cancelling..." : "Cancel appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
