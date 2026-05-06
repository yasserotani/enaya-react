import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { useEffect } from "react";
export default function ProtectedRoute({ children }) {
  const { token, user, fetchUser } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  return children;
}
