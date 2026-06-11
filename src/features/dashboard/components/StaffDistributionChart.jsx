import { getChartColors } from "../utils/chartTheme";

export default function StaffDistributionChart({
  totalPatients = 0,
  totalDoctors = 0,
  totalReceptionists = 0,
  isDark,
}) {
  const colors = getChartColors(isDark);
  const segments = [
    { name: "Patients", value: totalPatients, color: colors.primary },
    { name: "Doctors", value: totalDoctors, color: colors.accent },
    { name: "Receptionists", value: totalReceptionists, color: colors.secondary },
  ].filter((item) => item.value > 0);

  const total = segments.reduce((sum, item) => sum + item.value, 0);
  const radius = 36;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  let dashOffset = 0;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">People Overview</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Distribution across the clinic
        </p>
      </div>

      <div className="flex h-52 items-center justify-center">
        {segments.length === 0 ? (
          <p className="text-sm text-foreground/50">No data available</p>
        ) : (
          <div className="relative">
            <svg width="180" height="180" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={colors.grid}
                strokeWidth={strokeWidth}
              />
              <g transform="rotate(-90 50 50)">
                {segments.map((segment) => {
                  const dash = (segment.value / total) * circumference;
                  const circle = (
                    <circle
                      key={segment.name}
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="none"
                      stroke={segment.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${dash} ${circumference - dash}`}
                      strokeDashoffset={-dashOffset}
                      strokeLinecap="butt"
                    />
                  );
                  dashOffset += dash;
                  return circle;
                })}
              </g>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-2xl font-bold text-foreground">{total}</p>
              <p className="text-xs text-foreground/50">Total people</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 space-y-2">
        {segments.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-foreground/80">{item.name}</span>
            </div>
            <span className="font-medium text-foreground">
              {item.value}
              {total > 0 ? (
                <span className="ml-1 text-foreground/50">
                  ({Math.round((item.value / total) * 100)}%)
                </span>
              ) : null}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
