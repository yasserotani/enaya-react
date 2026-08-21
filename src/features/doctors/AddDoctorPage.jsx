import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
// import { Eye, EyeOff } from "lucide-react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import DatePickerField from "../../components/ui/DatePickerField";
import { createDoctor, fetchDepartments } from "./api/doctorsApi";
import { parseApiErrors } from "../../utils/parseApiErrors";

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none transition placeholder:text-foreground/30 focus:border-primary  focus:ring-primary/15";

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

export default function AddDoctorPage() {
  const navigate = useNavigate();
  const [serverErrors, setServerErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      phone: "",
      date_of_birth: "",
      gender: "",
      specialty: "",
      department_id: "",
      working_hours_start: "08:00",
      working_hours_end: "14:00",
    },
  });

  const password = watch("password");
  const timeSlots = [
    "07:00",
    "07:30",
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
  ];
  useEffect(() => {
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
  }, []);

  const fieldError = (field) =>
    errors[field]?.message || serverErrors[field]?.[0];

  const onSubmit = async (formData) => {
    try {
      setServerErrors({});

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
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

      const result = await createDoctor(payload);

      navigate("/doctors", {
        replace: true,
        state: {
          successMessage:
            result.message || `Doctor "${formData.name}" created successfully.`,
        },
      });
    } catch (err) {
      setServerErrors(parseApiErrors(err));
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-4">
      <Link
        to="/doctors"
        className="mb-4 inline-flex text-sm font-medium text-primary transition hover:text-secondary"
      >
        ← Back to doctors
      </Link>

      <div className="rounded-2xl border border-border bg-surface shadow-lg">
        <div className="border-b border-border px-6 py-5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Add Doctor
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            Create a new doctor account with clinic profile
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
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
                placeholder="Dr. Sam"
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
                autoComplete="off"
                className={inputClassName}
              />
            </Field>

            <Field
              label="Password"
              error={fieldError("password")}
              className="col-span-2 sm:col-span-1"
            >
              <div className="relative">
                <input
                  {...register("password", { required: true, minLength: 8 })}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`${inputClassName} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 transition hover:text-foreground/70"
                >
                  {showPassword ? (
                    <VisibilityOff size={18} />
                  ) : (
                    <Visibility size={18} />
                  )}
                </button>
              </div>
            </Field>

            <Field
              label="Confirm password"
              error={fieldError("password_confirmation")}
              className="col-span-2 sm:col-span-1"
            >
              <div className="relative">
                <input
                  {...register("password_confirmation", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  type={showPasswordConfirmation ? "text" : "password"}
                  autoComplete="new-password"
                  className={`${inputClassName} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation((prev) => !prev)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 transition hover:text-foreground/70"
                >
                  {showPasswordConfirmation ? (
                    <VisibilityOff size={18} />
                  ) : (
                    <Visibility size={18} />
                  )}
                </button>
              </div>
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
              <select
                {...register("working_hours_start", { required: true })}
                className={inputClassName}
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Working hours end"
              error={fieldError("working_hours_end")}
              className="col-span-2 sm:col-span-1"
            >
              <select
                {...register("working_hours_end", { required: true })}
                className={inputClassName}
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </Field>
          </div>

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
              {isSubmitting ? "Creating..." : "Create doctor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
