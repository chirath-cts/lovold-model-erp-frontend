import { useEffect, useState } from "react";

import { AUTH_SESSION_EVENT, getAuthSession } from "@/shared/lib/authSession";
import type { AuthUser } from "@/shared/types/auth";

export function useAuthSession() {
  const [session, setSession] = useState<AuthUser | null>(() => getAuthSession());

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
