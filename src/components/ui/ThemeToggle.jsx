import { useThemeStore } from "../../store/useThemeStore";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode"
export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="toggle theme"
      className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-secondary/50 hover:text-foreground"
    >
      {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small"/>}
    </button>
  );
};
