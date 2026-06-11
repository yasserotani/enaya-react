import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createUser } from "../api/usersApi";
import { parseApiErrors } from "../../../utils/parseApiErrors";

const ROLE_OPTIONS = [
  { value: "doctor", label: "Doctor" },
  { value: "receptionist", label: "Receptionist" },
];

export default function CreateUserModal({ open, onClose, onCreated }) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "receptionist",
      specialty: "",
      department_id: "",
    },
  });

  const [serverErrors, setServerErrors] = useState({});
  const selectedRole = watch("role");

  useEffect(() => {
    if (!open) {
      reset();
      setServerErrors({});
    }
  }, [open, reset]);

  if (!open) return null;

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
        payload.department_id = Number(formData.department_id);
      }

      await createUser(payload);
      onCreated();
      onClose();
    } catch (err) {
      setServerErrors(parseApiErrors(err));
    }
  };

  const fieldError = (field) =>
    serverErrors[field] ? (
      <p className="text-sm text-error">{serverErrors[field][0]}</p>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-xl font-bold text-foreground">Add User</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Create a doctor or receptionist account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          {serverErrors.general && (
            <div className="rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
              {serverErrors.general[0]}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground/75">
              Full name
            </label>
            <input
              {...register("name", { required: true })}
              type="text"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
            {fieldError("name")}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground/75">
              Email
            </label>
            <input
              {...register("email", { required: true })}
              type="email"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
            {fieldError("email")}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground/75">
              Password
            </label>
            <input
              {...register("password", { required: true })}
              type="password"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
            {fieldError("password")}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground/75">
              Role
            </label>
            <select
              {...register("role")}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldError("role")}
          </div>

          {selectedRole === "doctor" && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/75">
                  Specialty
                </label>
                <input
                  {...register("specialty", { required: selectedRole === "doctor" })}
                  type="text"
                  placeholder="e.g. Cardiology"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none transition placeholder:text-foreground/30 focus:border-primary focus:ring-4 focus:ring-primary/15"
                />
                {fieldError("specialty")}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/75">
                  Department ID
                </label>
                <input
                  {...register("department_id", {
                    required: selectedRole === "doctor",
                  })}
                  type="number"
                  min="1"
                  placeholder="e.g. 2"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none transition placeholder:text-foreground/30 focus:border-primary focus:ring-4 focus:ring-primary/15"
                />
                {fieldError("department_id")}
              </div>
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
              {isSubmitting ? "Creating..." : "Create user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
