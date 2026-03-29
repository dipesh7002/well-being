import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LoadingScreen } from "../common/LoadingScreen";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

