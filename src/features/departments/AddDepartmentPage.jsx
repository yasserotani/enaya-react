import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createDepartment } from "./api/departmentsApi";
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

export default function AddDepartmentPage() {
  const navigate = useNavigate();
  const [serverErrors, setServerErrors] = useState({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      name: "",
    },
  });

  const fieldError = (field) =>
    errors[field]?.message || serverErrors[field]?.[0];

  const onSubmit = async (formData) => {
    try {
      setServerErrors({});

      const payload = {
        name: formData.name,
      };

      const result = await createDepartment(payload);

      navigate("/departments", {
        replace: true,
        state: {
          successMessage:
            result.message || `Department "${formData.name}" created successfully.`,
        },
      });
    } catch (err) {
      setServerErrors(parseApiErrors(err));
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-4">
      <Link
        to="/departments"
        className="mb-4 inline-flex text-sm font-medium text-primary transition hover:text-secondary"
      >
        ← Back to departments
      </Link>

      <div className="rounded-2xl border border-border bg-surface shadow-lg">
        <div className="border-b border-border px-6 py-5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Add Department
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            Create a new hospital department
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          {serverErrors.general && (
            <div className="rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
              {serverErrors.general[0]}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <Field
              label="Department name"
              error={fieldError("name")}
              className="col-span-1"
            >
              <input
                {...register("name", { required: "Department name is required" })}
                type="text"
                placeholder="e.g. Cardiology"
                className={inputClassName}
              />
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
              {isSubmitting ? "Creating..." : "Create department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
