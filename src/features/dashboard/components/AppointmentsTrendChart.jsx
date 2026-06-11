import { useState } from "react";
import dayjs from "dayjs";
import { getChartColors } from "../utils/chartTheme";
import {
  buildAreaPath,
  buildLinePath,
  getScaleMax,
  getYAxisTicks,
} from "../utils/chartHelpers";
import ChartTooltip from "./ChartTooltip";

function formatChartDate(date) {
  return dayjs(date).format("MMM D");
}

const CHART = {
  left: 10,
  right: 4,
  top: 8,
  bottom: 18,
  width: 100,
  height: 100,
};

function getPlotPoints(data, maxValue) {
  const plotWidth = CHART.width - CHART.left - CHART.right;
  const plotHeight = CHART.height - CHART.top - CHART.bottom;
  const baselineY = CHART.top + plotHeight;

  const points = data.map((item, index) => {
    const x =
      CHART.left +
      (data.length === 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth);
    const y =
      CHART.top + plotHeight - (item.total / maxValue) * plotHeight;

    return { x, y, ...item };
  });

  return { points, baselineY, plotHeight };
}

export default function AppointmentsTrendChart({ data = [], isDark }) {
  const colors = getChartColors(isDark);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const chartData = data.map((item) => ({
    date: item.date,
    total: item.total,
    label: formatChartDate(item.date),
  }));

  const totalWeek = chartData.reduce((sum, item) => sum + item.total, 0);
  const maxValue = getScaleMax(chartData.map((item) => item.total));
  const yTicks = getYAxisTicks(maxValue);
  const { points, baselineY, plotHeight } = getPlotPoints(chartData, maxValue);
  const linePath = buildLinePath(points);
  const areaPath = buildAreaPath(points, baselineY);
  const hoveredPoint = hoveredIndex != null ? points[hoveredIndex] : null;

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

      <div className="relative h-64 w-full">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-foreground/50">
            No appointment data for this period
          </div>
        ) : (
          <>
            <div className="absolute inset-y-0 left-0 flex w-8 flex-col justify-between py-2 text-[10px] text-foreground/50">
              {[...yTicks].reverse().map((tick) => (
                <span key={tick}>{tick}</span>
              ))}
            </div>

            <svg
              viewBox={`0 0 ${CHART.width} ${CHART.height}`}
              preserveAspectRatio="none"
              className="ml-8 h-full w-[calc(100%-2rem)] overflow-visible"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <defs>
                <linearGradient id="appointmentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.primary} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={colors.primary} stopOpacity={0.02} />
                </linearGradient>
              </defs>

              {yTicks.map((tick) => {
                const y =
                  CHART.top + plotHeight - (tick / maxValue) * plotHeight;

                return (
                  <line
                    key={tick}
                    x1={CHART.left}
                    y1={y}
                    x2={CHART.width - CHART.right}
                    y2={y}
                    stroke={colors.grid}
                    strokeDasharray="1.5 1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}

              {areaPath ? (
                <path d={areaPath} fill="url(#appointmentGradient)" />
              ) : null}

              {linePath ? (
                <path
                  d={linePath}
                  fill="none"
                  stroke={colors.primary}
                  strokeWidth="0.6"
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}

              {points.map((point, index) => {
                const plotWidth = CHART.width - CHART.left - CHART.right;
                const bandWidth = plotWidth / chartData.length;

                return (
                  <g key={point.date}>
                    <rect
                      x={point.x - bandWidth / 2}
                      y={CHART.top}
                      width={bandWidth}
                      height={plotHeight}
                      fill="transparent"
                      onMouseEnter={() => setHoveredIndex(index)}
                    />
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={hoveredIndex === index ? "2.8" : "2.2"}
                      fill={colors.primary}
                      vectorEffect="non-scaling-stroke"
                      className="pointer-events-none"
                    />
                  </g>
                );
              })}
            </svg>

            <div className="ml-8 mt-2 flex justify-between text-[11px] text-foreground/50">
              {chartData.map((item) => (
                <span key={item.date}>{item.label}</span>
              ))}
            </div>

            {hoveredPoint ? (
              <ChartTooltip
                title={hoveredPoint.label}
                value={`${hoveredPoint.total} appointments`}
                style={{
                  left: `${((hoveredPoint.x - CHART.left) / (CHART.width - CHART.left - CHART.right)) * 100}%`,
                  top: `${(hoveredPoint.y / CHART.height) * 100}%`,
                  marginLeft: "2rem",
                  backgroundColor: colors.surface,
                  color: colors.text,
                }}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
