import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import DatePickerField from "../../../components/ui/DatePickerField";
import {
  rescheduleAppointment,
  updateAppointment,
} from "../api/appointmentsApi";
import {
  buildScheduledAt,
  canReschedule,
  getPatientName,
  normalizeSlotTime,
  normalizeStatus,
} from "../utils/appointmentHelpers";
import { parseApiErrors } from "../../../utils/parseApiErrors";
import TimeSlotPicker from "./TimeSlotPicker";

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15";

function Field({ label, error, children }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground/75">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}

export default function EditAppointmentModal({
  open,
  appointment,
  doctors = [],
  onClose,
  onUpdated,
}) {
  const [selectedSlot, setSelectedSlot] = useState("");
  const [serverErrors, setServerErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const initializedRef = useRef(false);

  const status = normalizeStatus(appointment?.status);
  const allowReschedule = canReschedule(status);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      doctor_id: "",
      date: "",
      visit_reason: "",
      notes: "",
    },
  });

  const date = watch("date");
  const doctorId = watch("doctor_id");

  const originalScheduledAt = appointment?.scheduled_at
    ? dayjs(appointment.scheduled_at)
    : null;
  const originalSlot = originalScheduledAt
    ? normalizeSlotTime(originalScheduledAt.format("HH:mm"))
    : "";
  const originalDate = originalScheduledAt?.format("YYYY-MM-DD") ?? "";
  const originalDoctorId = appointment?.doctor_id
    ? String(appointment.doctor_id)
    : "";

  useEffect(() => {
    if (!open || !appointment) {
      initializedRef.current = false;
      return;
    }

    reset({
      doctor_id: originalDoctorId,
      date: originalDate,
      visit_reason: appointment.visit_reason ?? "",
      notes: appointment.notes ?? "",
    });
    setSelectedSlot(originalSlot);
    setServerErrors({});
    setSubmitError(null);
    initializedRef.current = true;
  }, [open, appointment, originalDate, originalDoctorId, originalSlot, reset]);

  if (!open || !appointment) return null;

  const fieldError = (name) =>
    serverErrors[name]?.[0] ?? serverErrors.general?.[0];

  const handleDateChange = (val) => {
    const previousDate = date;
    setValue("date", val);

    if (initializedRef.current && val !== previousDate) {
      setSelectedSlot("");
    }
  };

  const handleDoctorChange = (event) => {
    const nextDoctorId = event.target.value;
    const previousDoctorId = doctorId;
    setValue("doctor_id", nextDoctorId);

    if (initializedRef.current && nextDoctorId !== previousDoctorId) {
      setSelectedSlot("");
    }
  };

  const onSubmit = async (values) => {
    setSubmitError(null);
    setServerErrors({});

    const visitReason = values.visit_reason.trim();
    const notes = values.notes.trim();
    const visitReasonChanged = visitReason !== (appointment.visit_reason ?? "");
    const notesChanged = notes !== (appointment.notes ?? "");
    const doctorChanged =
      Number(values.doctor_id) !== Number(appointment.doctor_id);
    const dateChanged = values.date !== originalDate;
    const slotChanged =
      normalizeSlotTime(selectedSlot) !== normalizeSlotTime(originalSlot);
    const timeChanged = allowReschedule && (dateChanged || slotChanged);

    if (timeChanged && !selectedSlot) {
      setSubmitError("Please select an available time slot.");
      return;
    }

    if (!visitReasonChanged && !notesChanged && !doctorChanged && !timeChanged) {
      setSubmitError("No changes to save.");
      return;
    }

    const scheduledAt = timeChanged
      ? buildScheduledAt(values.date, selectedSlot)
      : "";

    if (timeChanged && !scheduledAt) {
      setSubmitError("Could not build a valid appointment time.");
      return;
    }

    try {
      if (visitReasonChanged || notesChanged || doctorChanged) {
        await updateAppointment(appointment.id, {
          visit_reason: visitReason,
          notes: notes || null,
          ...(doctorChanged ? { doctor_id: Number(values.doctor_id) } : {}),
        });
      }

      if (timeChanged) {
        await rescheduleAppointment(appointment.id, {
          scheduled_at: scheduledAt,
        });
      }

      onUpdated?.();
      onClose();
    } catch (err) {
      const errors = parseApiErrors(err);
      setServerErrors(errors);
      setSubmitError(errors.general?.[0] || "Failed to update appointment");
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
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-lg font-semibold text-foreground">
              Edit appointment
            </h2>
            <p className="mt-1 text-sm text-foreground/60">
              {getPatientName(appointment)}
            </p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {(submitError || fieldError("general")) && (
              <div className="rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
                {submitError || fieldError("general")}
              </div>
            )}

            {allowReschedule && (
              <Field label="Doctor" error={fieldError("doctor_id")}>
                <select
                  value={doctorId}
                  onChange={handleDoctorChange}
                  className={inputClassName}
                >
                  <option value="">Select doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.full_name}
                      {doctor.specialty ? ` · ${doctor.specialty}` : ""}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field label="Visit reason" error={fieldError("visit_reason")}>
              <input
                {...register("visit_reason", { required: true })}
                className={inputClassName}
              />
            </Field>

            <Field label="Notes" error={fieldError("notes")}>
              <textarea
                {...register("notes")}
                rows={3}
                className={inputClassName}
              />
            </Field>

            {allowReschedule && (
              <>
                <Field label="Date" error={fieldError("scheduled_at")}>
                  <DatePickerField value={date} onChange={handleDateChange} />
                </Field>

                <Field label="Time slot" error={fieldError("scheduled_at")}>
                  <TimeSlotPicker
                    doctorId={doctorId || appointment.doctor_id}
                    date={date}
                    value={selectedSlot}
                    onChange={setSelectedSlot}
                    disabled={isSubmitting}
                  />
                </Field>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground/70 transition hover:bg-muted-light/60 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-secondary disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
