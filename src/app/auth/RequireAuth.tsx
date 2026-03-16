import type { PropsWithChildren } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthSession } from "@/shared/hooks/useAuthSession";

export function RequireAuth({ children }: PropsWithChildren) {
  const session = useAuthSession();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (children) return <>{children}</>;
  return <Outlet />;
}
