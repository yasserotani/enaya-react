import ReactDOM from "react-dom/client";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AppRouter from "./routes/AppRouter";
import { useThemeStore } from "./store/useThemeStore";
import "./index.css";

export function AppShell() {
  useThemeStore();

  return <AppRouter />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <AppShell />
  </LocalizationProvider>,
);
