import { useThemeStore } from "../../store/useThemeStore";

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="toggle theme"
      className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-secondary/50 hover:text-foreground"
    >
      {isDark ? "Light mode" : "Dark mode"}
    </button>
  );
};
