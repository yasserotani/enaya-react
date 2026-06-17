import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

function formatChartDate(date) {
  return dayjs(date).format("MMM D");
}

export default function AppointmentsTrendChart({ data = [] }) {
  const chartData = data.map((item) => ({
    date: formatChartDate(item.date),
    total: item.total,
  }));

  const totalWeek = chartData.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Appointments — Last 7 Days
          </h2>
          <p className="mt-1 text-sm text-foreground/60">
            Daily appointment volume over the past week
          </p>
        </div>

        <div className="rounded-xl bg-primary/10 px-3 py-1.5 text-right">
          <p className="text-xs font-medium text-foreground/60">Week total</p>
          <p className="text-lg font-bold text-primary">{totalWeek}</p>
        </div>
      </div>

      <div className="h-64 w-full">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-foreground/50">
            No appointment data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#6366f1"
                strokeWidth={4}
                dot={{ r: 4, fill: "#6366f1" }}
                activeDot={{ r: 6, fill: "#6366f1" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
