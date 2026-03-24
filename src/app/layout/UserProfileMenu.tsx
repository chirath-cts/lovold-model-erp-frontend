import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthSession } from "@/shared/hooks/useAuthSession";
import { clearAuthSession } from "@/shared/lib/authSession";

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

export function UserProfileMenu() {
  const session = useAuthSession();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayName = useMemo(() => {
    const name = [session?.firstName, session?.lastName].filter(Boolean).join(" ").trim();
    if (name) return name;
    if (session?.username) return session.username;
    if (session?.email) return session.email;
    return "Account";
  }, [session]);

  const roleLabel = session?.role || "User";
  const email = session?.email || "No email available";

  const initials = useMemo(() => {
    const source =
      [session?.firstName, session?.lastName].filter(Boolean).join(" ").trim() ||
      session?.username ||
      session?.email ||
      "U";

    return source
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [session]);

  const avatarSrc =
    (session as { avatarUrl?: string; avatar?: string; image?: string } | null)?.avatarUrl ??
    (session as { avatarUrl?: string; avatar?: string; image?: string } | null)?.avatar ??
    (session as { avatarUrl?: string; avatar?: string; image?: string } | null)?.image;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
    setOpen(false);
  };

  return (
    <div className="relative flex items-center gap-3 border-l border-[#c0c7cf]/40 pl-3 md:pl-4" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 text-left"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#003a4d] text-sm font-semibold text-white">
          {avatarSrc ? (
            <img src={avatarSrc} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="hidden leading-tight lg:block">
          <p className="text-sm font-semibold text-[#111d23] truncate">{displayName}</p>
          <p className="text-xs text-[#70787f] capitalize truncate">{roleLabel}</p>
        </div>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-[#d7e5ed] bg-white shadow-[0_12px_30px_rgba(0,58,77,0.15)]"
        >
          <div className="border-b border-[#d7e5ed] px-4 py-3">
            <p className="text-sm font-semibold text-[#111d23] truncate">{displayName}</p>
            <p className="text-xs text-[#40484e] truncate">{email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-[#111d23] transition-colors hover:bg-[#e8f6fe]"
          >
            <LogoutIcon className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
