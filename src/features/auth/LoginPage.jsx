import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "./useAuth";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
export default function LoginPage() {
  const { login } = useAuth();
  const [serverErrors, setServerErrors] = useState({});
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setServerErrors({});
      await login(data);
    } catch (err) {
      const errors = err.response?.data?.errors;
      const message = err.response?.data?.message || err.response?.data?.error;

      if (errors) {
        setServerErrors(errors);
      } else if (message) {
        setServerErrors({ general: [message] });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <ThemeToggle />
      <div className="relative w-full max-w-md rounded-2xl border border-primary/25 bg-background p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Enaya <span className="text-primary">Admin</span>
          </h1>
          <h2 className="mt-2 text-sm text-foreground/60">
            Login To Your Admin Account
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverErrors.general && (
            <p className="rounded-lg border border-accent/30 bg-error/10 px-4 py-3 text-sm text-error">
              {serverErrors.general[0]}
            </p>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground/70">
              Email or Username
            </label>
            <input
              {...register("usernameOrEmail")}
              type="text"
              placeholder="admin@clinic.com or admin"
              className="w-full rounded-lg border border-foreground/15 bg-background px-4 py-3 text-foreground placeholder:text-foreground/30 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {serverErrors.usernameOrEmail && (
              <p className="text-sm text-error">
                {serverErrors.usernameOrEmail[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground/70">
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              className="w-full rounded-lg border border-foreground/15 bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {serverErrors.password && (
              <p className="text-sm text-error">{serverErrors.password[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-background transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "logging in..." : "login"}
          </button>
        </form>
      </div>
    </div>
  );
}
