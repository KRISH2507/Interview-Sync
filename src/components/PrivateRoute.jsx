import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { getCurrentUser } from "../services/api";

export default function PrivateRoute({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      try {
        const user = await getCurrentUser();
        if (mounted) {
          setIsAuthenticated(Boolean(user?.id));
        }
      } catch {
        if (mounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setIsChecking(false);
        }
      }
    };

    verifySession();

    return () => {
      mounted = false;
    };
  }, []);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}
