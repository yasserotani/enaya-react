import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import axiosClient from "../../api/axiosClient";

export function useAuth() {
  const { token, user, isLoading, setAuth, clearAuth, setLoading } =
    useAuthStore();
  const navigate = useNavigate();

  const fetchUser = useCallback(async () => {
    // If there's no token, we aren't logging in
    if (!token) {
      setLoading(false);
      return;
    }
    // If the user object is already present, no need to duplicate network fetch
    if (user) return;

    try {
      const res = await axiosClient.get("/auth/me");
      setAuth(token, res.data.data.user);
    } catch {
      clearAuth();
    }
  }, [clearAuth, setAuth, setLoading, token, user]);

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
      // Fallback local cleanup
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  }, [clearAuth, navigate]);

  return { token, fetchUser, login, logout, user, isLoading };
}
