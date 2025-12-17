// src/features/auth/components/RequireAuth.tsx
import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn } from "../utils/authStorage";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
