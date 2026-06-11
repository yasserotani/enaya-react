export function getScaleMax(values, min = 1) {
  const max = Math.max(...values, 0);
  if (max === 0) return min;
  return Math.ceil(max * 1.15) || min;
}

export function buildLinePath(points) {
  if (!points.length) return "";
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

export function buildAreaPath(points, baselineY) {
  if (!points.length) return "";
  const line = buildLinePath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${line} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
}

export function getYAxisTicks(max, count = 4) {
  if (max <= 0) return [0];

  const step = Math.max(1, Math.ceil(max / count));
  const ticks = [];

  for (let value = 0; value <= max; value += step) {
    ticks.push(value);
  }

  if (ticks[ticks.length - 1] < max) {
    ticks.push(max);
  }

  return ticks;
}
