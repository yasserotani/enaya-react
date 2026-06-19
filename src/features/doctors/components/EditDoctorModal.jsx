import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import DatePickerField from "../../../components/ui/DatePickerField";
import { fetchDepartments, updateDoctor } from "../api/doctorsApi";
import { parseApiErrors } from "../../../utils/parseApiErrors";

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15";

function Field({ label, error, children, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-foreground/75">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}

export default function EditDoctorModal({ open, doctor, onClose, onUpdated }) {
  const [serverErrors, setServerErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();

  useEffect(() => {
    if (!open) {
      reset();
      setServerErrors({});
      return;
    }

    let cancelled = false;

    async function loadDepartments() {
      setDepartmentsLoading(true);
      try {
        const result = await fetchDepartments();
        if (!cancelled) {
          setDepartments(Array.isArray(result) ? result : (result.data ?? []));
        }
      } catch {
        if (!cancelled) setDepartments([]);
      } finally {
        if (!cancelled) setDepartmentsLoading(false);
      }
    }

    void loadDepartments();

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !doctor) return;

    reset({
      name: doctor.full_name ?? doctor.name ?? "",
      email: doctor.email ?? "",
      phone: doctor.phone ?? "",
      date_of_birth: doctor.date_of_birth ?? "",
      gender: doctor.gender ?? "",
      specialty: doctor.specialty ?? "",
      department_id:
        doctor.department?.id ??
        doctor.department_id ??
        doctor.departmentId ??
        "",
      working_hours_start: doctor.working_hours_start ?? "",
      working_hours_end: doctor.working_hours_end ?? "",
    });
    setServerErrors({});
  }, [open, doctor, reset]);

  if (!open || !doctor) return null;

  const fieldError = (field) => serverErrors[field]?.[0];
  const name = doctor.full_name ?? doctor.name;

  const onSubmit = async (formData) => {
    try {
      setServerErrors({});

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        specialty: formData.specialty,
        department_id: Number(formData.department_id),
        working_hours_start: formData.working_hours_start,
        working_hours_end: formData.working_hours_end,
      };

      if (formData.date_of_birth) {
        payload.date_of_birth = formData.date_of_birth;
      }

      await updateDoctor(doctor.id, payload);
      onUpdated();
      onClose();
    } catch (err) {
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

      <div className="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-xl flex-col rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex-shrink-0 border-b border-border px-6 py-5">
          <h2 className="text-xl font-bold text-foreground">Edit Doctor</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Doctor profile
            <span className="ml-1 text-foreground/80">· {name}</span>
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {serverErrors.general && (
              <div className="rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
                {serverErrors.general[0]}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Full name"
                error={fieldError("name")}
                className="col-span-2"
              >
                <input
                  {...register("name", { required: true })}
                  type="text"
                  className={inputClassName}
                />
              </Field>

              <Field
                label="Email"
                error={fieldError("email")}
                className="col-span-2 sm:col-span-1"
              >
                <input
                  {...register("email", { required: true })}
                  type="email"
                  className={inputClassName}
                />
              </Field>

              <Field
                label="Phone"
                error={fieldError("phone")}
                className="col-span-2 sm:col-span-1"
              >
                <input
                  {...register("phone", { required: true })}
                  type="tel"
                  placeholder="+963912345678 or 09xxxxxxxx"
                  className={inputClassName}
                />
              </Field>

              <Field
                label="Gender"
                error={fieldError("gender")}
                className="col-span-2 sm:col-span-1"
              >
                <select
                  {...register("gender", { required: true })}
                  className={inputClassName}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </Field>

              <Field
                label="Date of birth"
                error={fieldError("date_of_birth")}
                className="col-span-2 sm:col-span-1"
              >
                <Controller
                  name="date_of_birth"
                  control={control}
                  render={({ field }) => (
                    <DatePickerField
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldError("date_of_birth")}
                    />
                  )}
                />
              </Field>

              <Field
                label="Specialty"
                error={fieldError("specialty")}
                className="col-span-2 sm:col-span-1"
              >
                <input
                  {...register("specialty", { required: true })}
                  type="text"
                  placeholder="e.g. Cardiology"
                  className={inputClassName}
                />
              </Field>

              <Field
                label="Department"
                error={fieldError("department_id")}
                className="col-span-2 sm:col-span-1"
              >
                <select
                  {...register("department_id", { required: true })}
                  disabled={departmentsLoading}
                  className={inputClassName}
                >
                  <option value="">
                    {departmentsLoading
                      ? "Loading departments..."
                      : "Select department"}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Working hours start"
                error={fieldError("working_hours_start")}
                className="col-span-2 sm:col-span-1"
              >
                <input
                  {...register("working_hours_start", { required: true })}
                  type="time"
                  className={inputClassName}
                />
              </Field>

              <Field
                label="Working hours end"
                error={fieldError("working_hours_end")}
                className="col-span-2 sm:col-span-1"
              >
                <input
                  {...register("working_hours_end", { required: true })}
                  type="time"
                  className={inputClassName}
                />
              </Field>
            </div>
          </div>

          <div className="flex flex-shrink-0 justify-end gap-3 rounded-b-2xl border-t border-border bg-surface px-6 py-4">
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
      </div>
    </div>
  );
}
