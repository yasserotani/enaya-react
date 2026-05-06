import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import axiosClient from "../../api/axiosClient";
export function useAuth() {
  const { token, user, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const fetchUser = async () => {
    if (!token || user) return;
    try {
      const res = await axiosClient.get("/auth/me");
      setAuth(token, res.data.data.user);
    } catch (err) {
      clearAuth();
    }
  };

  const login = async (credentials) => {
    const res = await axiosClient.post("/auth/login", credentials);
    console.log(res.data);
    const token = res.data.data.token;
    const user = res.data.data.user;
    setAuth(token, user);
    navigate("/dashboard", { replace: true });
  };

  const logout = async () => {
    await axiosClient.post("/auth/logout");
    clearAuth();
    navigate("/login", { replace: true });
  };

  return { token, fetchUser, login, logout, user };
}
