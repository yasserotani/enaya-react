import { useState } from "react";
import { useAuth } from "./useAuth";
import { set } from "react-hook-form";

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
    <div>
      <button
        onClick={handleLogut}
        className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-background transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
}
