import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import DatePickerField from "../../components/ui/DatePickerField";
import { createPatient } from "./api/patientsApi";
import { parseApiErrors } from "../../utils/parseApiErrors";
const inputClassName =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none transition placeholder:text-foreground/30 focus:border-primary focus:ring-4 focus:ring-primary/15";

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

export default function AddPatientPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [serverErrors, setServerErrors] = useState({});

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
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

  // Prefill name if coming from appointment modal
  useEffect(() => {
    if (location.state?.prefillName) {
      setValue("full_name", location.state.prefillName);
    }
  }, [location.state, setValue]);

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

      const result = await createPatient(payload);

      // Check if we should return to appointment creation
      if (location.state?.returnToAppointment) {
        const patientData = result.data || result;
        const newPatient = {
          id: patientData.id,
          full_name: formData.full_name,
          phone: formData.phone,
          gender: formData.gender,
          date_of_birth: formData.date_of_birth,
          address: formData.address,
          job: formData.job,
        };

        navigate("/queue", {
          replace: true,
          state: {
            newlyCreatedPatient: newPatient,
            openAppointmentModal: true,
            appointmentFormData: location.state.appointmentFormData,
          },
        });
        return;
      }

      navigate("/patients", {
        replace: true,
        state: {
          successMessage:
            result.message ||
            `Patient "${formData.full_name}" created successfully.`,
        },
      });
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
    <div className="mx-auto max-w-2xl py-4">
      <Link
        to="/patients"
        className="mb-4 inline-flex text-sm font-medium text-primary transition hover:text-secondary"
      >
        ← Back to patients
      </Link>

      <div className="rounded-2xl border border-border bg-surface shadow-lg">
        <div className="border-b border-border px-6 py-5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Add Patient
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            Register a new walk-in patient record
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          {serverErrors.general && (
            <div className="rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
              {serverErrors.general[0]}
            </div>
          )}

          <Field label="Full name" error={fieldError("full_name")}>
            <input
              {...register("full_name", { required: true })}
              type="text"
              className={inputClassName}
            />
          </Field>

          <Field label="Phone" error={fieldError("phone")}>
            <input
              {...register("phone", { required: true })}
              type="tel"
              placeholder="+963912345678 or 09xxxxxxxx"
              className={inputClassName}
            />
          </Field>

          <Field label="Gender" error={fieldError("gender")}>
            <select
              {...register("gender", { required: true })}
              className={inputClassName}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </Field>

          <Field label="Date of birth" error={fieldError("date_of_birth")}>
            <Controller
              name="date_of_birth"
              control={control}
              render={({ field }) => (
                <DatePickerField
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldError("date_of_birth")}
                  className="text-foreground"
                />
              )}
            />
          </Field>

          <Field label="Address" error={fieldError("address")}>
            <input
              {...register("address")}
              type="text"
              className={inputClassName}
            />
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
              onClick={() => {
                reset();
                setServerErrors({});
              }}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground/80 transition hover:bg-muted-light"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Creating..." : "Create patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
