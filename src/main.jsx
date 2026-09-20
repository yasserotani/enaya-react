import ReactDOM from "react-dom/client";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AppRouter from "./routes/AppRouter";
import { useThemeStore } from "./store/useThemeStore";
import "./index.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function AppShell() {
  useThemeStore();

  return <AppRouter />;
}
console.log("Loaded Client ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AppShell />
    </LocalizationProvider>
  </GoogleOAuthProvider>,
);
