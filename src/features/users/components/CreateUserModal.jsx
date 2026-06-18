import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createUser } from "../api/usersApi";
import { parseApiErrors } from "../../../utils/parseApiErrors";
import DatePickerField from "../../../components/ui/DatePickerField";
import { Controller } from "react-hook-form";
const ROLE_OPTIONS = [
  { value: "doctor", label: "Doctor" },
  { value: "receptionist", label: "Receptionist" },
];

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none transition placeholder:text-foreground/30 focus:border-primary focus:ring-4 focus:ring-primary/15";

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

export default function CreateUserModal({ open, onClose, onCreated }) {
  const [serverErrors, setServerErrors] = useState({});

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control, 
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "receptionist",
      specialty: "",
      department_id: "",
      gender: "",
      date_of_birth: "", // optional but recommended
    },
  });

  const selectedRole = watch("role");

  useEffect(() => {
    if (!open) {
      reset();
      setServerErrors({});
    }
  }, [open, reset]);

  if (!open) return null;

  const fieldError = (field) => serverErrors[field]?.[0];

  const onSubmit = async (formData) => {
    try {
      setServerErrors({});

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      if (formData.role === "doctor") {
        payload.specialty = formData.specialty;
        payload.phone = formData.phone;
        payload.gender = formData.gender;
        if (formData.date_of_birth) {
          payload.date_of_birth = formData.date_of_birth;
        }
        payload.department_id = Number(formData.department_id);
      }

      await createUser(payload);
      onCreated();
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

      <div className="relative z-10 flex w-full max-w-xl max-h-[calc(100vh-2rem)] flex-col rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="border-b border-border px-6 py-5 flex-shrink-0">
          <h2 className="text-xl font-bold text-foreground">Add User</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Create a doctor or receptionist account
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
          autoComplete="off"
        >
          {/* Scrollable Form Content Body */}
          <div className="px-6 py-5 overflow-y-auto space-y-4 flex-1">
            {serverErrors.general && (
              <div className="rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error break-words whitespace-pre-wrap">
                {serverErrors.general[0]}
              </div>
            )}

            {/* --- Explicit Grid Layout Container --- */}
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
                  autoComplete="off"
                />
              </Field>

              <Field
                label="Password"
                error={fieldError("password")}
                className="col-span-2 sm:col-span-1"
              >
                <input
                  {...register("password", { required: true })}
                  type="password"
                  className={inputClassName}
                  autoComplete="new-password"
                />
              </Field>

              <Field
                label="Role"
                error={fieldError("role")}
                className="col-span-2"
              >
                <select {...register("role")} className={inputClassName}>
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Dynamic Doctor Fields */}
              {selectedRole === "doctor" && (
                <>
                  <Field
                    label="Phone"
                    error={fieldError("phone")}
                    className="col-span-2 sm:col-span-1"
                  >
                    <input
                      {...register("phone", { required: true })}
                      type="tel"
                      className={inputClassName}
                      autoComplete="off"
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
                  >
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
                  <Field
                    label="Department ID"
                    error={fieldError("department_id")}
                    className="col-span-2 sm:col-span-1"
                  >
                    <input
                      {...register("department_id", { required: true })}
                      type="number"
                      min="1"
                      placeholder="e.g. 2"
                      className={inputClassName}
                    />
                  </Field>
                </>
              )}
            </div>
          </div>

          {/* Modal Footer Controls - Stays Fixed at Bottom */}
          <div className="flex-shrink-0 flex justify-end gap-3 border-t border-border px-6 py-4 bg-surface rounded-b-2xl">
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
              {isSubmitting ? "Creating..." : "Create user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
