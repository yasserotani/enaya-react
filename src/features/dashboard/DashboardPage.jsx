import { useEffect } from "react";
import LogoutButton from "../auth/LogoutButton";
import { useAuth } from "../auth/useAuth";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
export default function DashboardPage() {
  const { fetchUser, user } = useAuth();
  useEffect(() => {
    fetchUser();
    console.log("User in DashboardPage:", user);
  }, []);
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4">
      <ThemeToggle />
      <h1 className="text-3xl font-bold text-foreground">
        Welcome to the Dashboard Mr. {user ? user.username : "Loading..."}
      </h1>
      <LogoutButton className="bg-primary bt" />
    </div>
  );
}
