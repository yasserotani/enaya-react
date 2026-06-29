import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "./useAuth";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import logoImg from "../../assets/icon-logo.png";

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
      } else {
        setServerErrors({ general: [err.message || "Unable to reach server"] });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-6">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center">
        <div className="w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <div className="border-b border-border bg-linear-to-br from-primary/10 via-primary/5 to-secondary/10 px-6 py-6 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                  Enaya <span className="text-primary">Admin</span>
                </h1>
                <p className="mt-2 text-sm font-medium text-foreground/60 sm:text-base">
                  login to your account
                </p>
              </div>

              <img
                src={logoImg}
                alt="Enaya logo"
                className="h-24 w-24 shrink-0 object-contain drop-shadow-sm sm:h-28 sm:w-28"
              />
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {serverErrors.general && (
                <div className="rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
                  {serverErrors.general[0]}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/75">
                  Email or Username
                </label>
                <input
                  {...register("usernameOrEmail")}
                  type="text"
                  placeholder="admin@clinic.com or admin"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-foreground/30 focus:border-primary focus:ring-4 focus:ring-primary/15"
                />
                {serverErrors.usernameOrEmail && (
                  <p className="text-sm text-error">
                    {serverErrors.usernameOrEmail[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/75">
                  Password
                </label>
                <input
                  {...register("password")}
                  type="password"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                />
                {serverErrors.password && (
                  <p className="text-sm text-error">
                    {serverErrors.password[0]}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold tracking-wide text-background transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Logging in..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
