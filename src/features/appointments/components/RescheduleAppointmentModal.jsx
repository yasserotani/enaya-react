import { useEffect, useState } from "react";
import dayjs from "dayjs";
import DatePickerField from "../../../components/ui/DatePickerField";
import { rescheduleAppointment } from "../api/appointmentsApi";
import { buildScheduledAt, getPatientName } from "../utils/appointmentHelpers";
import { parseApiErrors } from "../../../utils/parseApiErrors";
import TimeSlotPicker from "./TimeSlotPicker";

export default function RescheduleAppointmentModal({
  open,
  appointment,
  onClose,
  onRescheduled,
}) {
  const [date, setDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const doctorId = appointment?.doctor_id;

  useEffect(() => {
    if (!open || !appointment) return;

    const scheduled = appointment.scheduled_at
      ? dayjs(appointment.scheduled_at)
      : dayjs();

    setDate(scheduled.format("YYYY-MM-DD"));
    setSelectedSlot(scheduled.format("HH:mm"));
    setError(null);
  }, [open, appointment]);

  if (!open || !appointment) return null;

  const handleDateChange = (val) => {
    setDate(val);
    setSelectedSlot("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !selectedSlot) {
      setError("Please select a date and time slot.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await rescheduleAppointment(appointment.id, {
        scheduled_at: buildScheduledAt(date, selectedSlot),
      });
      onRescheduled?.();
      onClose();
    } catch (err) {
      const errors = parseApiErrors(err);
      setError(errors.general?.[0] || "Failed to reschedule appointment");
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
              Reschedule appointment
            </h2>
            <p className="mt-1 text-sm text-foreground/60">
              Choose a new time for {getPatientName(appointment)}
            </p>
          </div>

          <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-5">
            {error && (
              <div className="rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground/75">
                Date
              </label>
              <DatePickerField value={date} onChange={handleDateChange} />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground/75">
                Time slot
              </label>
              <TimeSlotPicker
                doctorId={doctorId}
                date={date}
                value={selectedSlot}
                onChange={setSelectedSlot}
                disabled={isSubmitting}
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
              Close
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedSlot}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-secondary disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Reschedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
