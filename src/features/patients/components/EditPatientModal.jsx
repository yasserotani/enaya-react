import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import DatePickerField from "../../../components/ui/DatePickerField";
import { fetchPatientById, updatePatient } from "../api/patientsApi";
import { parseApiErrors } from "../../../utils/parseApiErrors";

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

export default function EditPatientModal({ open, patient, onClose, onUpdated }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [serverErrors, setServerErrors] = useState({});

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      full_name: "",
      phone: "",
      date_of_birth: "",
      gender: "",
      address: "",
      job: "",
    },
  });

  useEffect(() => {
    if (!open || !patient) {
      reset();
      setServerErrors({});
      setLoadError(null);
      return;
    }

    let cancelled = false;

    async function loadPatient() {
      setIsLoading(true);
      setLoadError(null);
      setServerErrors({});

      try {
        const data = await fetchPatientById(patient.id);
        if (cancelled) return;

        reset({
          full_name: data.full_name ?? "",
          phone: data.phone ?? "",
          date_of_birth: data.date_of_birth ?? "",
          gender: data.gender ?? "",
          address: data.address ?? "",
          job: data.job ?? "",
        });
      } catch (err) {
        if (cancelled) return;

        const message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load patient details";

        setLoadError(message);
        reset({
          full_name: patient.full_name ?? "",
          phone: patient.phone ?? "",
          date_of_birth: "",
          gender: "",
          address: "",
          job: "",
        });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadPatient();

    return () => {
      cancelled = true;
    };
  }, [open, patient, reset]);

  if (!open || !patient) return null;

  const fieldError = (field) => serverErrors[field]?.[0];

  const onSubmit = async (formData) => {
    try {
      setServerErrors({});

      const payload = {
        full_name: formData.full_name,
        phone: formData.phone,
        gender: formData.gender,
      };

      if (formData.date_of_birth) {
        payload.date_of_birth = formData.date_of_birth;
      }
      if (formData.address) {
        payload.address = formData.address;
      }
      if (formData.job) {
        payload.job = formData.job;
      }

      await updatePatient(patient.id, payload);
      onUpdated();
      onClose();
    } catch (err) {
      if (err.response?.status === 409) {
        const message =
          err.response?.data?.message ||
          "A patient with this phone number already exists.";
        setServerErrors({ phone: [message] });
        return;
      }

      setServerErrors(parseApiErrors(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-background/40 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-xl font-bold text-foreground">Edit Patient</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Patient profile
            <span className="ml-1 text-foreground/80">· {patient.full_name}</span>
          </p>
        </div>

        {isLoading ? (
          <p className="px-6 py-10 text-center text-sm text-foreground/50">
            Loading patient details...
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
            {loadError && (
              <div className="rounded-xl border border-warning-border bg-warning-light px-4 py-3 text-sm text-warning">
                {loadError}
              </div>
            )}

            {serverErrors.general && (
              <div className="rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
                {serverErrors.general[0]}
              </div>
            )}

           
    <Field label="Full name" error={fieldError("full_name")}>
      <input {...register("full_name", { required: true })} type="text" className={inputClassName} />
    </Field>

    <div className="grid grid-cols-2 gap-4">
      <Field label="Phone" error={fieldError("phone")}>
        <input {...register("phone", { required: true })} type="tel" placeholder="+963912345678" className={inputClassName} />
      </Field>

      <Field label="Gender" error={fieldError("gender")}>
        <select {...register("gender", { required: true })} className={inputClassName}>
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </Field>

      <Field label="Date of birth" error={fieldError("date_of_birth")}>
        <Controller name="date_of_birth" control={control} render={({ field }) => (
          <DatePickerField value={field.value} onChange={field.onChange} error={fieldError("date_of_birth")} />
        )} />
      </Field>

      <Field label="Job" error={fieldError("job")}>
        <input {...register("job")} type="text" className={inputClassName} />
      </Field>
    </div>

    <Field label="Address" error={fieldError("address")}>
      <input {...register("address")} type="text" className={inputClassName} />
    </Field>
    <Field label="Job" error={fieldError("job")}>
      <input
        {...register("job")}
        type="text"
        className={inputClassName}
      />
            </Field>

            <div className="flex justify-end gap-3 border-t border-border pt-5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground/80 transition hover:bg-muted-light"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
