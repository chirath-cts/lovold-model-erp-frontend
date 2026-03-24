import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { authService } from "@/services/endpoints/authService";
import { ApiError } from "@/services/errors";
import { getAuthSession, saveAuthSession } from "@/shared/lib/authSession";

function GearIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.6-2.5 4.2-4 8-4s6.4 1.5 8 4" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
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
      <rect x="6" y="10" width="12" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
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
      <path d="M12 22s8-3 8-10V5l-8-3-8 3v7c0 7 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const [form, setForm] = useState({ username: "", password: "", remember: true });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    if (session) {
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, redirectPath]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const username = form.username.trim();
    if (!username || !form.password) {
      setError("Username and password are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const user = await authService.login({ username, password: form.password });
      saveAuthSession(user);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 401
          ? "Invalid username or password."
          : "Unable to sign in right now. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputBaseClasses =
    "w-full bg-[#e6e8eb] border-none rounded-sm px-4 py-3.5 text-[#191c1e] text-sm font-medium placeholder:text-[#70787f] focus:ring-0 focus:outline-none transition-all duration-200";

  return (
    <div className="h-screen min-h-[100dvh] bg-[#f7f9fc] text-[#191c1e]">
      <main className="flex h-full flex-col overflow-hidden md:flex-row">
        <section className="relative hidden h-full overflow-hidden bg-[#004260] md:block md:w-3/5">
          <img
            className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-multiply transition-transform duration-1000"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4LXG0oT-4QjhcUExpMXtqRQjXrajGLc-neNWKMG0hScp20p3QLTGrXHlxRxGiwVRo0jQ9632twrVIw_qNZXBiZkJH8oDGigA1-lWNhOp7jb4wb4dtzX51FYKeJ27lSYwQT04tKx8fCUOHg_vUzaU7wHzmQnp6lUduiIpdpOZXmGhufj90rX3qSdPUymqftMzY3GzkleT5NRRB12Z76WFjbL-OgZmgVJ7yXF1uZ7gmYls8kqh6K2MONf64BZBwLvfsKIVpfu2anP8"
            alt="Aquaculture operations backdrop"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#004260] via-transparent to-transparent opacity-90" />

          <div className="absolute bottom-16 left-16 z-10 max-w-lg text-white">
            <div className="mb-6 flex items-center space-x-2">
              <span className="h-[2px] w-8 bg-[#005b82]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b4cad6]">
                Operational Excellence
              </span>
            </div>
            <h2 className="mb-4 text-4xl font-black leading-[1.1] tracking-tight lg:text-5xl">
              Subsurface
              <br />
              Precision ERP
            </h2>
            <p className="max-w-md text-lg font-medium leading-relaxed text-[#cfe6f2] opacity-90">
              Synchronized control systems for high-stakes aquaculture engineering environments.
            </p>
            <div className="mt-12 flex gap-8 text-sm font-mono">
              <div className="flex flex-col">
                <span className="mb-1 text-[10px] font-bold uppercase tracking-tight text-[#b4cad6]">
                  Network Status
                </span>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>EN_SECURE_LINK_ON</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="mb-1 text-[10px] font-bold uppercase tracking-tight text-[#b4cad6]">
                  Node Activity
                </span>
                <span>4.2 TB/s SENS_DTA</span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex h-full w-full flex-col overflow-y-auto bg-[#f7f9fc] md:w-2/5">
          <div className="flex items-center justify-between p-6 md:p-10 lg:p-12">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#004260] text-white">
                <GearIcon className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black leading-none tracking-tight text-[#004260]">LOVOLD</span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#40484e]">
                  Industrial Forge
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-grow flex-col justify-center px-6 py-8 md:px-14 lg:px-20">
            <div className="mb-10">
              <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-[#191c1e]">
                Internal Operations Access
              </h1>
              <p className="text-sm font-medium text-[#40484e]">
                Secure internal access required. Authenticate to proceed to the command console.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-sm border border-[#ffdad6] bg-[#fff2ef] px-4 py-3 text-sm font-medium text-[#93000a]">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="group">
                <label
                  className="mb-2 block px-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#40484e]"
                  htmlFor="username"
                >
                  Email or Employee ID
                </label>
                <div className="relative group">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#40484e]">
                    <UserIcon className="h-5 w-5" />
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    placeholder="e.g. operational_admin"
                    className={`${inputBaseClasses} pl-10`}
                    value={form.username}
                    onChange={(event) => {
                      setForm((prev) => ({ ...prev, username: event.target.value }));
                      if (error) setError(null);
                    }}
                  />
                  <span className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 bg-[#004260] transition-all duration-300 group-focus-within:w-full" />
                </div>
              </div>

              <div className="group">
                <div className="mb-2 flex items-center justify-between px-1">
                  <label
                    className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#40484e]"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <a
                    className="text-[11px] font-bold text-[#004260] transition-colors hover:text-[#005b82]"
                    href="#"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative group">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#40484e]">
                    <LockIcon className="h-5 w-5" />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="********"
                    className={`${inputBaseClasses} pl-10 pr-12`}
                    value={form.password}
                    onChange={(event) => {
                      setForm((prev) => ({ ...prev, password: event.target.value }));
                      if (error) setError(null);
                    }}
                  />
                  <span className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 bg-[#004260] transition-all duration-300 group-focus-within:w-full" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#40484e] transition-colors hover:text-[#191c1e]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 3l18 18" />
                        <path d="M10.477 10.485A3 3 0 0 0 13.5 13.5" />
                        <path d="M9.88 5.082A8.96 8.96 0 0 1 12 5c5 0 9 4.5 9 7s-4 7-9 7c-1.45 0-2.82-.28-4.06-.79" />
                        <path d="M6.12 6.117C4.083 7.276 2.5 9.132 2.5 12c0 2.5 3.5 7 9.5 7 1.22 0 2.38-.19 3.46-.54" />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <label className="group flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, remember: event.target.checked }))
                    }
                    className="h-4 w-4 rounded-sm border-[#c0c7cf] bg-[#e6e8eb] text-[#004260] transition-all focus:ring-[#004260] focus:ring-offset-0"
                  />
                  <span className="ml-3 text-sm font-medium text-[#40484e] transition-colors group-hover:text-[#191c1e]">
                    Remember session for 12 hours
                  </span>
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center rounded-sm bg-gradient-to-r from-[#004260] to-[#005b82] py-4 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-[#004260]/10 transition-all hover:opacity-95 hover:shadow-[#004260]/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <circle className="opacity-30" cx="12" cy="12" r="9" />
                        <path d="M21 12a9 9 0 0 1-9 9" />
                      </svg>
                      <span className="tracking-[0.14em]">Signing In</span>
                    </span>
                  ) : (
                    <span className="tracking-[0.2em]">Sign In to System</span>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-12 flex items-start gap-3 rounded-sm bg-[#f2f4f7] p-4">
              <ShieldCheckIcon className="mt-0.5 h-5 w-5 text-[#004260]" />
              <p className="text-[11px] leading-relaxed text-[#40484e]">
                This system is monitored for security purposes. Unauthorized access attempts are logged and reported
                to the Lovold Security Operations Center (LSOC). Use of this software implies consent to the{" "}
                <a className="font-bold text-[#191c1e] underline" href="#">
                  Digital Security Policy
                </a>
                .
              </p>
            </div>
          </div>

          <footer className="mt-auto border-t border-[#191c1e]/5 bg-[#f7f9fc]">
            <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center justify-between gap-4 px-8 py-8 md:flex-row md:px-12">
              <div className="text-center md:text-left">
                <span className="text-lg font-black text-[#004260]">Lovold Solution.</span>
                <p className="mt-1 text-[12px] tracking-tight text-[#40484e]">
                  (c) 2024 Lovold Solution. Subsurface Precision ERP. All rights reserved.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-[12px] tracking-tight text-[#40484e]">
                <a className="transition-colors hover:text-[#005b82]" href="#">
                  System Status
                </a>
                <a className="transition-colors hover:text-[#005b82]" href="#">
                  Terms of Use
                </a>
                <a className="transition-colors hover:text-[#005b82]" href="#">
                  Security Policy
                </a>
                <a className="transition-colors hover:text-[#005b82]" href="#">
                  Technical Support
                </a>
              </div>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
