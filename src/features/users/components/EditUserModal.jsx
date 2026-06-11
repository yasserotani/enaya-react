import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import DatePickerField from "../../../components/ui/DatePickerField";
import {
  fetchUserById,
  updatePatient,
  updateUser,
} from "../api/usersApi";
import { parseApiErrors } from "../../../utils/parseApiErrors";

function getRoleName(role) {
  return typeof role === "string" ? role : role?.name ?? "";
}

function getUserRole(user) {
  const roles = user?.roles ?? [];
  return roles.length > 0 ? getRoleName(roles[0]) : "";
}

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

export default function EditUserModal({ open, user, onClose, onUpdated }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [serverErrors, setServerErrors] = useState({});
  const [patientId, setPatientId] = useState(null);

  const role = user ? getUserRole(user) : "";

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();

  useEffect(() => {
    if (!open || !user) {
      reset();
      setServerErrors({});
      setLoadError(null);
      setPatientId(null);
      return;
    }

    let cancelled = false;

    async function loadUser() {
      setIsLoading(true);
      setLoadError(null);
      setServerErrors({});
      setPatientId(null);

      try {
        const data = await fetchUserById(user.id);
        if (cancelled) return;

        if (role === "patient") {
          setPatientId(data.id);
          reset({
            full_name: data.full_name ?? "",
            phone: data.phone ?? "",
            date_of_birth: data.date_of_birth ?? "",
            gender: data.gender ?? "",
            address: data.address ?? "",
            job: data.job ?? "",
          });
        } else if (role === "doctor") {
          reset({
            name: data.name ?? user.name ?? "",
            email: data.email ?? user.email ?? "",
            specialty: data.specialty ?? "",
            department_id: data.departmentId ?? data.department_id ?? "",
          });
        } else {
          reset({
            name: data.username ?? data.name ?? user.name ?? "",
            email: data.email ?? user.email ?? "",
          });
        }
      } catch (err) {
        if (cancelled) return;

        const message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load user details";

        setLoadError(message);

        if (role === "patient") {
          reset({
            full_name: user.name ?? "",
            phone: "",
            date_of_birth: "",
            gender: "",
            address: "",
            job: "",
          });
        } else {
          reset({
            name: user.name ?? "",
            email: user.email ?? "",
            specialty: "",
            department_id: "",
          });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, [open, user, role, reset]);

  if (!open || !user) return null;

  const fieldError = (field) => serverErrors[field]?.[0];

  const onSubmit = async (formData) => {
    try {
      setServerErrors({});

      if (role === "patient") {
        if (!patientId) {
          setServerErrors({
            general: ["Patient record not found. Please close and try again."],
          });
          return;
        }

        await updatePatient(patientId, {
          full_name: formData.full_name,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender,
          address: formData.address || null,
          job: formData.job || null,
        });
      } else {
        const payload = {
          name: formData.name,
          email: formData.email,
        };

        if (role === "doctor") {
          payload.specialty = formData.specialty;
          payload.department_id = Number(formData.department_id);
        }

        await updateUser(user.id, payload);
      }

      onUpdated();
      onClose();
    } catch (err) {
      setServerErrors(parseApiErrors(err));
    }
  };

  const roleLabels = {
    doctor: "Doctor account",
    receptionist: "Receptionist account",
    patient: "Patient profile",
    admin: "Admin account",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-xl font-bold text-foreground">Edit User</h2>
          <p className="mt-1 text-sm text-foreground/60">
            {roleLabels[role] ?? "User account"}
            <span className="ml-1 text-foreground/80">· {user.name}</span>
          </p>
        </div>

        {isLoading ? (
          <p className="px-6 py-10 text-center text-sm text-foreground/50">
            Loading user details...
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

            {role === "patient" ? (
              <>
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
                    placeholder="+963912345678"
                    className={inputClassName}
                  />
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
                      />
                    )}
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
              </>
            ) : (
              <>
                <Field label="Full name" error={fieldError("name")}>
                  <input
                    {...register("name", { required: true })}
                    type="text"
                    className={inputClassName}
                  />
                </Field>

                <Field label="Email" error={fieldError("email")}>
                  <input
                    {...register("email", { required: true })}
                    type="email"
                    className={inputClassName}
                  />
                </Field>

                {role === "doctor" && (
                  <>
                    <Field label="Specialty" error={fieldError("specialty")}>
                      <input
                        {...register("specialty", { required: true })}
                        type="text"
                        placeholder="e.g. Cardiology"
                        className={inputClassName}
                      />
                    </Field>

                    <Field
                      label="Department ID"
                      error={fieldError("department_id")}
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
              </>
            )}

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
