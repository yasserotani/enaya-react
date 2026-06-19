import { create } from "zustand";

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("token") || null,
  user: null,
  // If there is an existing token, set loading to true until fetchUser finishes
  isLoading: !!localStorage.getItem("token"),

  setAuth: (token, user) => {
    localStorage.setItem("token", token);
    set({ token, user, isLoading: false });
  },

  clearAuth: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null, isLoading: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
