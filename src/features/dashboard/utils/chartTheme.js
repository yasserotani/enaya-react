export function getChartColors(isDark) {
  if (isDark) {
    return {
      primary: "#57eaea",
      secondary: "#3cc8c3",
      accent: "#197bd2",
      warning: "#fbbf24",
      success: "#4ade80",
      info: "#38bdf8",
      muted: "#94a3b8",
      grid: "#1e293b",
      text: "#e3f2f7",
      surface: "#0d1117",
    };
  }

  return {
    primary: "#15a8a8",
    secondary: "#37c3be",
    accent: "#2d90e6",
    warning: "#d97706",
    success: "#16a34a",
    info: "#0284c7",
    muted: "#64748b",
    grid: "#e2e8f0",
    text: "#08171c",
    surface: "#ffffff",
  };
}
