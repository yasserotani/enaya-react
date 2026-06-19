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
      className={`w-full text-left rounded-xl px-4 py-2.5 text-sm font-medium text-error/80 hover:bg-error/10 hover:text-error transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isLoading ? "Logging out..." : "Logout"}
    </button>
  );
}
