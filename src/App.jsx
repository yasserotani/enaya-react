import { useEffect } from "react";
import { useAuth } from "./features/auth/useAuth";
import AppRouter from "./routes/AppRouter";
import LogoutButton from "./features/auth/LogoutButton";
export default function App() {
  const { fetchUser } = useAuth();
  useEffect(() => {
    fetchUser();
  }, []);
  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
  };
  return (
    <div>
      <AppRouter />
      <h1>React App</h1>
      <h1 className="text-2xl font-bold text-teal-800">Tailwind works!</h1>
    </div>
  );
}
