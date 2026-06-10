import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center px-4 bg-background">
      <div className="py-10 px-30 flex flex-col items-center gap-3 text-center border-2 border-primary rounded-2xl">
        <h1 className="text-5xl font-black tracking-tight text-foreground md:text-6xl">
          404
        </h1>
        <p className="text-base text-foreground/70 md:text-lg">
          Page not found
        </p>
        <Link
          to="/dashboard"
          className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-background transition hover:bg-secondary"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
