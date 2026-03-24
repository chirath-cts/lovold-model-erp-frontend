import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { authService } from "@/services/endpoints/authService";
import { ApiError } from "@/services/errors";
import { getAuthSession, saveAuthSession } from "@/shared/lib/authSession";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const [form, setForm] = useState({ username: "", password: "", remember: true });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    "w-full rounded-xl bg-white/90 ring-1 ring-[#c1c7cc] focus:ring-2 focus:ring-[#003a4d] px-4 py-3 text-sm font-medium text-[#0f1d24] placeholder:text-[#7b8a93] outline-none transition shadow-[0_8px_20px_rgba(0,58,77,0.06)]";

  return (
    <div className="min-h-screen bg-[#f4faff] text-[#0f1d24]">
      <main className="min-h-screen flex flex-col md:flex-row">
        <section className="relative hidden md:flex md:w-7/12 overflow-hidden bg-gradient-to-br from-[#003a4d] to-[#00526c] text-white">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAP1nqBGd2djHqTotypbpjQCGR_JkJNcErftcdCFJFuCI4KJgReE2ST0SShu9Zu1_SmCCEm0tADWn9RolYTY46n0aHolGGUH4L74yQw1lxxhHxPA7x8INeoh9j9Pp00pPVQIpohkCuSulmFLhqil6u0cb0dI52ZrlaoQEzClsAkAw_U8x1SaDBnMD-YN2CoMcgsgmZPniJF2mFm96Sfg-mMledxC4ltcojcxji28p7sqLkE4Ewp5CbFKygyDU48eZoF28WFFxr9674')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div className="relative z-10 flex flex-col justify-between w-full h-full p-12 xl:p-16 gap-10">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v7" />
                  <circle cx="12" cy="9" r="2" />
                  <path d="M12 13v8" />
                  <path d="M5 12a7 7 0 0 0 14 0" />
                  <path d="M5 12h3" />
                  <path d="M16 12h3" />
                </svg>
              </span>
              <div>
                <p className="text-sm text-white/70 tracking-[0.2em] font-semibold uppercase">Lovold</p>
                <p className="font-extrabold text-3xl leading-tight tracking-tight">
                  ERP Platform
                </p>
              </div>
            </div>

            <div className="max-w-2xl space-y-6">
              <p className="font-bold text-5xl leading-[1.05] tracking-tight">
                Operational Architect for Global Aquaculture
              </p>
              <p className="text-lg text-[#bfe9ff] max-w-xl font-medium">
                Empowering aquaculture operations with order promise and fulfillment control.
              </p>
              <div className="grid grid-cols-2 gap-6 max-w-xl">
                <div className="bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/10">
                  <p className="font-mono text-[#c0e8ff] text-[11px] mb-2 tracking-wide">LATENCY_SYNC</p>
                  <p className="font-extrabold text-3xl">99.98%</p>
                  <p className="text-white/70 text-sm">Fulfillment Accuracy</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/10">
                  <p className="font-mono text-[#c0e8ff] text-[11px] mb-2 tracking-wide">SYSTEM_STATUS</p>
                  <p className="font-extrabold text-3xl">OPTIMAL</p>
                  <p className="text-white/70 text-sm">Real-time Logistics</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white/50 text-[11px] font-mono tracking-[0.24em] uppercase">
              <span>v2.4.0</span>
              <span className="w-8 h-px bg-white/20" />
              <span>ISO 27001 Certified</span>
            </div>
          </div>

          <div className="absolute bottom-0 right-0 w-full h-1/2 pointer-events-none opacity-20">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAP1nqBGd2djHqTotypbpjQCGR_JkJNcErftcdCFJFuCI4KJgReE2ST0SShu9Zu1_SmCCEm0tADWn9RolYTY46n0aHolGGUH4L74yQw1lxxhHxPA7x8INeoh9j9Pp00pPVQIpohkCuSulmFLhqil6u0cb0dI52ZrlaoQEzClsAkAw_U8x1SaDBnMD-YN2CoMcgsgmZPniJF2mFm96Sfg-mMledxC4ltcojcxji28p7sqLkE4Ewp5CbFKygyDU48eZoF28WFFxr9674"
              alt="Industrial ropes and marine equipment"
              className="w-full h-full object-cover mix-blend-overlay"
              loading="lazy"
            />
          </div>
        </section>

        <section className="flex-1 flex items-center justify-center bg-[#f4faff] p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="md:hidden flex flex-col items-center mb-10">
              <div className="w-16 h-16 bg-[#003a4d] flex items-center justify-center rounded-2xl text-white shadow-lg">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v7" />
                  <circle cx="12" cy="9" r="2" />
                  <path d="M12 13v8" />
                  <path d="M5 12a7 7 0 0 0 14 0" />
              <path d="M5 12h3" />
              <path d="M16 12h3" />
                </svg>
              </div>
              <p className="font-extrabold text-2xl text-[#002330] tracking-tight">
                Lovold ERP
              </p>
              <p className="text-[#41484c] text-sm font-medium mt-1">Operational Architect</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-[#d6e5ee] shadow-[0_18px_50px_rgba(0,44,64,0.12)] rounded-2xl p-6 sm:p-8">
              <header className="mb-8">
                <p className="font-bold text-3xl text-[#0f1d24] tracking-tight">
                  System Access
                </p>
                <p className="text-[#41484c] text-sm mt-1">
                  Enter your credentials to manage operations.
                </p>
              </header>

              {error && (
                <div className="mb-6 rounded-xl border border-[#ffdad6] bg-[#fff2ef] px-4 py-3 text-sm font-medium text-[#93000a]">
                  {error}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                <div className="space-y-2">
                  <label
                    className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#41484c]"
                    htmlFor="username"
                  >
                    Username or Enterprise Email
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71787c]">
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.7}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z" />
                        <path d="M21 21a7 7 0 0 0-14 0" />
                      </svg>
                    </span>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      placeholder="e.g. j.coordinator@lovold.com"
                      className={`${inputBaseClasses} pl-10`}
                      value={form.username}
                      onChange={(event) => {
                        setForm((prev) => ({ ...prev, username: event.target.value }));
                        if (error) setError(null);
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#41484c]"
                      htmlFor="password"
                    >
                      Access Key
                    </label>
                    <a className="text-xs font-semibold text-[#1f6581] hover:text-[#003a4d] transition-colors" href="#">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71787c]">
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.7}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="6" y="10" width="12" height="10" rx="2" />
                        <path d="M8 10V7a4 4 0 1 1 8 0v3" />
                      </svg>
                    </span>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      placeholder="••••••••••"
                      className={`${inputBaseClasses} pl-10 pr-12`}
                      value={form.password}
                      onChange={(event) => {
                        setForm((prev) => ({ ...prev, password: event.target.value }));
                        if (error) setError(null);
                      }}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 text-sm text-[#41484c] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, remember: event.target.checked }))
                    }
                    className="h-4 w-4 rounded border-[#c1c7cc] text-[#003a4d] focus:ring-[#003a4d]"
                  />
                  <span className="font-medium">Maintain active session for 12 hours</span>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#003a4d] to-[#00526c] text-white py-4 px-5 font-bold text-base shadow-[0_18px_40px_rgba(0,58,77,0.22)] transition-all hover:brightness-110 active:translate-y-[1px] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <circle className="opacity-30" cx="12" cy="12" r="9" />
                        <path d="M21 12a9 9 0 0 1-9 9" />
                      </svg>
                      <span>Signing In</span>
                    </>
                  ) : (
                    <>
                      <span>Authenticate Access</span>
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        className="h-5 w-5 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14" />
                        <path d="M13 6l6 6-6 6" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <footer className="mt-10 pt-7 border-t border-[#d6e5ee]">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-[#9bf7a4] rounded-md text-[#002108] inline-flex">
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 12 2 2 4-4" />
                      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0f1d24]">Secure Enterprise Protocol</p>
                    <p className="text-[10px] text-[#41484c] font-mono tracking-tight uppercase">
                      AES-256 Encrypted Connection
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between text-[10px] text-[#71787c] font-mono uppercase tracking-[0.18em]">
                  <span>© 2024 Lovold Logistics</span>
                  <div className="flex gap-4">
                    <a className="hover:text-[#003a4d] transition-colors" href="#">
                      Privacy
                    </a>
                    <a className="hover:text-[#003a4d] transition-colors" href="#">
                      Terms
                    </a>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
