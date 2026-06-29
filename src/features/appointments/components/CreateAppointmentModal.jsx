import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import DatePickerField from "../../../components/ui/DatePickerField";
import { fetchPatients } from "../../patients/api/patientsApi";
import { createAppointment } from "../api/appointmentsApi";
import { buildScheduledAt } from "../utils/appointmentHelpers";
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

export default function CreateAppointmentModal({
  open,
  doctors = [],
  onClose,
  onCreated,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [patientSearch, setPatientSearch] = useState("");
  const [debouncedPatientSearch, setDebouncedPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [serverErrors, setServerErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

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
      date: dayjs().format("YYYY-MM-DD"),
      visit_reason: "",
      notes: "",
    },
  });

  const doctorId = watch("doctor_id");
  const date = watch("date");

  useEffect(() => {
    if (!open) return;

    reset({
      doctor_id: "",
      date: dayjs().format("YYYY-MM-DD"),
      visit_reason: "",
      notes: "",
    });
    setPatientSearch("");
    setDebouncedPatientSearch("");
    setPatientResults([]);
    setSelectedPatient(null);
    setSelectedSlot("");
    setServerErrors({});
    setSubmitError(null);
  }, [open, reset]);

  // Handle returning from patient creation page
  useEffect(() => {
    if (open && location.state?.newlyCreatedPatient) {
      const newPatient = location.state.newlyCreatedPatient;
      setSelectedPatient(newPatient);
      setPatientSearch("");
      setPatientResults([]);
      // Clear the state to avoid re-processing
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [open, location, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPatientSearch(patientSearch.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [patientSearch]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function searchPatients() {
      if (!debouncedPatientSearch) {
        setPatientResults([]);
        return;
      }

      setIsSearchingPatients(true);

      try {
        const result = await fetchPatients({
          search: debouncedPatientSearch,
          per_page: 8,
        });
        if (!cancelled) {
          setPatientResults(result.data ?? []);
        }
      } catch {
        if (!cancelled) setPatientResults([]);
      } finally {
        if (!cancelled) setIsSearchingPatients(false);
      }
    }

    void searchPatients();

    return () => {
      cancelled = true;
    };
  }, [debouncedPatientSearch, open]);

  useEffect(() => {
    setSelectedSlot("");
  }, [doctorId, date, open]);

  if (!open) return null;

  const fieldError = (name) =>
    serverErrors[name]?.[0] ?? serverErrors.general?.[0];

  const onSubmit = async (values) => {
    if (!selectedPatient) {
      setSubmitError("Please select a patient.");
      return;
    }

    if (!selectedSlot) {
      setSubmitError("Please select an available time slot.");
      return;
    }

    const scheduledAt = buildScheduledAt(date, selectedSlot);

    if (!scheduledAt) {
      setSubmitError(
        "Could not build a valid appointment time. Pick the date and slot again.",
      );
      return;
    }

    setSubmitError(null);
    setServerErrors({});

    try {
      await createAppointment({
        patient_id: selectedPatient.id,
        doctor_id: Number(values.doctor_id),
        scheduled_at: scheduledAt,
        visit_reason: values.visit_reason.trim(),
        notes: values.notes.trim() || undefined,
      });
      onCreated?.();
      onClose();
    } catch (err) {
      const errors = parseApiErrors(err);
      setServerErrors(errors);
      setSubmitError(errors.general?.[0] || "Failed to create appointment");
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
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-lg font-semibold text-foreground">
              New appointment
            </h2>
            <p className="mt-1 text-sm text-foreground/60">
              Book an appointment for a patient
            </p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {(submitError || fieldError("general")) && (
              <div className="rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
                {submitError || fieldError("general")}
              </div>
            )}

            <Field label="Patient" error={fieldError("patient_id")}>
              {selectedPatient ? (
                <div className="flex items-center justify-between rounded-xl border border-border bg-muted-light/20 px-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {selectedPatient.full_name}
                    </p>
                    <p className="text-sm text-foreground/60">
                      {selectedPatient.phone}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPatient(null)}
                    className="text-sm font-medium text-primary hover:text-secondary"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="search"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Search by name or phone..."
                    className={inputClassName}
                  />
                  {isSearchingPatients && (
                    <p className="text-sm text-foreground/50">Searching...</p>
                  )}
                  {patientResults.length > 0 && (
                    <ul className="max-h-40 overflow-y-auto rounded-xl border border-border bg-background">
                      {patientResults.map((patient) => (
                        <li key={patient.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setPatientSearch("");
                              setPatientResults([]);
                            }}
                            className="flex w-full flex-col px-4 py-2.5 text-left transition hover:bg-muted-light/40"
                          >
                            <span className="font-medium text-foreground">
                              {patient.full_name}
                            </span>
                            <span className="text-sm text-foreground/60">
                              {patient.phone}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </Field>

            <Field label="Doctor" error={fieldError("doctor_id")}>
              <select
                {...register("doctor_id", { required: true })}
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

            <Field label="Date" error={fieldError("scheduled_at")}>
              <DatePickerField
                value={date}
                onChange={(val) => setValue("date", val)}
              />
            </Field>

            <Field label="Time slot" error={fieldError("scheduled_at")}>
              <TimeSlotPicker
                doctorId={doctorId}
                date={date}
                value={selectedSlot}
                onChange={setSelectedSlot}
                disabled={isSubmitting}
              />
            </Field>

            <Field label="Visit reason" error={fieldError("visit_reason")}>
              <input
                {...register("visit_reason", { required: true })}
                placeholder="e.g. Regular checkup"
                className={inputClassName}
              />
            </Field>

            <Field label="Notes" error={fieldError("notes")}>
              <textarea
                {...register("notes")}
                rows={2}
                placeholder="Optional notes"
                className={inputClassName}
              />
            </Field>
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
              {isSubmitting ? "Booking..." : "Book appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
