import React from "react";
import { useThemeStore } from "../../store/useThemeStore";

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-full border border-primary/30 bg-background px-3 py-2 text-sm text-foreground transition hover:bg-secondary hover:text-background"
    >
      {isDark ? "Light mode" : "Dark mode"}
    </button>
  );
};
