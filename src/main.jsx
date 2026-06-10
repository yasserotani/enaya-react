import ReactDOM from "react-dom/client";
import AppRouter from "./routes/AppRouter";
import { useThemeStore } from "./store/useThemeStore";
import "./index.css";

export function AppShell() {
  useThemeStore();

  return <AppRouter />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<AppShell />);
