import { useEffect } from "react";
import { useAuth } from "./features/auth/useAuth"; // Update path if needed
import AppRoutes from "./routes"; // Your React Router switch setup

export default function App() {
  const { fetchUser, isLoading } = useAuth();

  // Trigger profile fetching immediately if a token exists in localStorage
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // CRITICAL: Block rendering routes until we know if the token is valid or invalid
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <p className="text-sm text-foreground/50 animate-pulse">
          Restoring session...
        </p>
      </div>
    );
  }

  return <AppRoutes />;
}
