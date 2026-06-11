import { getChartColors } from "../utils/chartTheme";
import { getScaleMax } from "../utils/chartHelpers";

export default function AppointmentStatusChart({
  appointmentsToday = 0,
  completedToday = 0,
  pendingAppointments = 0,
  isDark,
}) {
  const colors = getChartColors(isDark);
  const scheduledToday = Math.max(
    appointmentsToday - completedToday - pendingAppointments,
    0,
  );

  const chartData = [
    { name: "Completed", value: completedToday, color: colors.success },
    { name: "Pending", value: pendingAppointments, color: colors.warning },
    { name: "Scheduled", value: scheduledToday, color: colors.accent },
  ].filter((item) => item.value > 0);

  const maxValue = getScaleMax(chartData.map((item) => item.value));

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Today&apos;s Appointments</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Status breakdown for today
          </p>
        </div>
        <div className="rounded-xl bg-accent/10 px-3 py-1.5 text-right">
          <p className="text-xs font-medium text-foreground/60">Total today</p>
          <p className="text-lg font-bold text-accent">{appointmentsToday}</p>
        </div>
      </div>

      <div className="h-56 w-full">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-foreground/50">
            No appointments scheduled for today
          </div>
        ) : (
          <div className="flex h-full items-end gap-4 px-2 pb-8">
            {chartData.map((item) => {
              const height = Math.max((item.value / maxValue) * 100, 8);

              return (
                <div
                  key={item.name}
                  className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-sm font-semibold text-foreground">
                    {item.value}
                  </span>
                  <div
                    className="w-full max-w-20 rounded-t-xl transition-all"
                    style={{
                      height: `${height}%`,
                      backgroundColor: item.color,
                      minHeight: "1.5rem",
                    }}
                    title={`${item.name}: ${item.value}`}
                  />
                  <span className="text-center text-xs font-medium text-foreground/60">
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
