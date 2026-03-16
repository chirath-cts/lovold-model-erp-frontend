import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { AUTH_SESSION_EVENT, getAuthSession } from "@/shared/lib/authSession";

function useAuthSession() {
  const [session, setSession] = useState(getAuthSession());

  useEffect(() => {
    const sync = () => setSession(getAuthSession());
    window.addEventListener("storage", sync);
    window.addEventListener(AUTH_SESSION_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(AUTH_SESSION_EVENT, sync);
    };
  }, []);

  return session;
}

export function RequireAuth({ children }: PropsWithChildren) {
  const session = useAuthSession();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (children) return <>{children}</>;
  return <Outlet />;
}
