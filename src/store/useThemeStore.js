import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set) => ({
      isDark: window.matchMedia("(prefers-color-scheme: dark)").matches,

      toggleTheme: () =>
        set((state) => {
          const next = !state.isDark;
          document.documentElement.classList.toggle("dark", next);
          return { isDark: next };
        }),
    }),
    {
      name: "theme",
      onRehydrateStorage: () => (state) => {
        // apply the saved theme immediately on page load
        document.documentElement.classList.toggle("dark", state?.isDark);
      },
    },
  ),
);
