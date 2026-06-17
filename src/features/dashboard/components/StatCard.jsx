export default function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  accent = "primary",
}) {
  const accentStyles = {
    primary: "from-primary/20 to-primary/5 text-primary",
    accent: "from-accent/20 to-accent/5 text-accent",
    success: "from-success/20 to-success/5 text-success",
    warning: "from-warning/20 to-warning/5 text-warning",
    info: "from-info/20 to-info/5 text-info",
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground/60">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {value ?? "—"}
          </p>
          {sublabel ? (
            <p className="mt-1 text-xs text-foreground/50">{sublabel}</p>
          ) : null}
        </div>
        {Icon ? (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl  ${accentStyles[accent] ?? accentStyles.primary}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
