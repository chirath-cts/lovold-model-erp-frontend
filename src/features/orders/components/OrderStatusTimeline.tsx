import type { OrderStatus } from "@/shared/types/domain";
import { ORDER_STATUS_FLOW } from "@/features/orders/model/orderHelpers";

function FactoryIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 20h18" />
      <path d="M5 20V8l5 3V8l5 3V4l4 3v13" />
      <path d="M9 20v-4" />
      <path d="M14 20v-3" />
      <path d="M18 20v-5" />
    </svg>
  );
}

const getStepState = (step: OrderStatus, current: OrderStatus) => {
  if (step === current) return "current";
  const currentIndex = ORDER_STATUS_FLOW.indexOf(current);
  const stepIndex = ORDER_STATUS_FLOW.indexOf(step);

  if (step === "cancelled") {
    return current === "cancelled" ? "current" : "upcoming";
  }

  if (current === "cancelled") {
    return "upcoming";
  }

  if (stepIndex > -1 && currentIndex > -1 && stepIndex < currentIndex) return "done";
  return "upcoming";
};

export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  const visibleSteps: OrderStatus[] =
    status === "cancelled"
      ? ["draft", "confirmed", "cancelled"]
      : ORDER_STATUS_FLOW.filter((step) => step !== "cancelled");

  return (
    <section className="rounded-[1.9rem] border border-[var(--border-soft)] bg-white p-6 shadow-[0_18px_48px_-28px_rgba(15,23,42,0.25)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Lifecycle progress
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Lifecycle Progress
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Orders move from commercial intake through reservation, production, and delivery.
          </p>
        </div>
        <div className="rounded-full border border-[var(--brand-200)] bg-[var(--brand-100)] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-900)]">
          Active: {status.replaceAll("_", " ")}
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="relative flex min-w-[700px] items-start justify-between gap-3 pb-2">
          <div className="absolute left-5 right-5 top-5 h-[4px] rounded-full bg-[var(--surface-muted)]" />
          {visibleSteps.map((step) => {
            const state = getStepState(step, status);

            return (
              <div key={step} className="relative z-10 flex w-full flex-col items-center gap-3">
                <div
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-sm",
                    state === "done" && "bg-[var(--brand-900)] text-white",
                    state === "current" && "bg-[var(--brand-700)] text-white ring-4 ring-[var(--brand-100)]",
                    state === "upcoming" && "bg-[var(--surface-muted)] text-[var(--text-muted)]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {step === "in_production" || step === "cancelled" ? (
                    <FactoryIcon className="h-4 w-4" />
                  ) : null}
                </div>
                <div className="text-center">
                  <div
                    className={[
                      "text-[11px] font-bold uppercase tracking-[0.14em]",
                      state === "current"
                        ? "text-[var(--brand-900)]"
                        : state === "done"
                          ? "text-[var(--text-primary)]"
                          : "text-[var(--text-muted)]",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {step.replaceAll("_", " ")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
