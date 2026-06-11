export default function ChartTooltip({ title, value, style }) {
  if (!title) return null;

  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border px-3 py-2 text-sm shadow-lg"
      style={style}
    >
      <p className="font-medium">{title}</p>
      {value ? <p className="text-primary">{value}</p> : null}
    </div>
  );
}
