import { useEffect } from "react";
import { useAuth } from "../auth/useAuth";

export default function UsersPage() {
  const { fetchUser, user } = useAuth();

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  return (
    <div className="page-container">
      <div className="page-card">
        <div className="page-content">
          <h1 className="page-title">Welcom to the users page</h1>
          <p className="max-w-lg text-sm text-foreground/70 md:text-base">
            the users hasn't fetched yet
          </p>
        </div>
      </div>
    </div>
  );
}
