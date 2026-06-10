import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import axiosClient from "../../api/axiosClient";
export function useAuth() {
  const { token, user, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const fetchUser = useCallback(async () => {
    if (!token || user) return;
    try {
      const res = await axiosClient.get("/auth/me");
      setAuth(token, res.data.data.user);
    } catch {
      clearAuth();
    }
  }, [clearAuth, setAuth, token, user]);

  const login = useCallback(
    async (credentials) => {
      const res = await axiosClient.post("/auth/login", credentials);
      const token = res.data.data.token;
      const user = res.data.data.user;
      setAuth(token, user);
      navigate("/dashboard", { replace: true });
    },
    [navigate, setAuth],
  );

  const logout = useCallback(async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch {
      // Even if logout fails on backend, clear local auth state
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  }, [clearAuth, navigate]);

  return { token, fetchUser, login, logout, user };
}
