import { useState } from "react";
import { useAuth } from "./useAuth";

export default function LogoutButton() {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogut = async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <button
      type="button"
      onClick={handleLogut}
      disabled={isLoading}
      className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-background transition hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? "Logging out..." : "Logout"}
    </button>
  );
}
