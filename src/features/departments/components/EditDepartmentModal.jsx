import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { updateDepartment } from "../api/departmentsApi";
import { parseApiErrors } from "../../../utils/parseApiErrors";

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

export default function EditDepartmentModal({ open, department, onClose, onUpdated }) {
  const [serverErrors, setServerErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (open && department) {
      reset({
        name: department.name || "",
      });
      setServerErrors({});
    }
  }, [open, department, reset]);

  const fieldError = (field) =>
    errors[field]?.message || serverErrors[field]?.[0];

  const onSubmit = async (formData) => {
    if (!department) return;

    try {
      setIsSubmitting(true);
      setServerErrors({});

      const payload = {
        name: formData.name,
      };

      await updateDepartment(department.id, payload);

      onUpdated();
      onClose();
    } catch (err) {
      setServerErrors(parseApiErrors(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface shadow-xl">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Edit Department</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          {serverErrors.general && (
            <div className="rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
              {serverErrors.general[0]}
            </div>
          )}

          <Field
            label="Department name"
            error={fieldError("name")}
          >
            <input
              {...register("name", { required: "Department name is required" })}
              type="text"
              placeholder="e.g. Cardiology"
              className={inputClassName}
            />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground/80 transition hover:bg-muted-light disabled:cursor-not-allowed disabled:opacity-50"
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
