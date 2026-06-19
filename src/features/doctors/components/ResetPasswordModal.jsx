import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { resetDoctorPassword } from "../api/doctorsApi";
import { parseApiErrors } from "../../../utils/parseApiErrors";

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

export default function ResetPasswordModal({
  open,
  doctor,
  onClose,
  onReset,
}) {
  const [serverErrors, setServerErrors] = useState({});

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  const password = watch("password");

  useEffect(() => {
    if (!open) {
      reset();
      setServerErrors({});
    }
  }, [open, reset]);

  if (!open || !doctor) return null;

  const fieldError = (field) => serverErrors[field]?.[0];
  const name = doctor.full_name ?? doctor.name;

  const onSubmit = async (formData) => {
    try {
      setServerErrors({});
      await resetDoctorPassword(doctor.id, {
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });
      onReset();
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

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-xl font-bold text-foreground">Reset password</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Set a new password for{" "}
            <span className="font-medium text-foreground">{name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          {serverErrors.general && (
            <div className="rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
              {serverErrors.general[0]}
            </div>
          )}

          <Field label="New password" error={fieldError("password")}>
            <input
              {...register("password", { required: true, minLength: 8 })}
              type="password"
              autoComplete="new-password"
              className={inputClassName}
            />
          </Field>

          <Field
            label="Confirm password"
            error={fieldError("password_confirmation")}
          >
            <input
              {...register("password_confirmation", {
                required: true,
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              type="password"
              autoComplete="new-password"
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
              {isSubmitting ? "Saving..." : "Reset password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
