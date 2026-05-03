import axios from "axios";
import { navigate } from "@reach/router";
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // required for Sanctum
  headers: { Accept: "application/json" },
});
// auto-attach token to every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
// auto-handle expired token → redirect to login
axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
    }
    return Promise.reject(err);
  },
);
export default axiosClient;
