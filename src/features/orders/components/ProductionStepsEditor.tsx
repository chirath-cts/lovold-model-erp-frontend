import type { WorkCenter } from "@/shared/types/domain";
import type { ProductionStepDraft } from "@/features/orders/model/orderHelpers";

function PlusIcon({ className }: { className?: string }) {
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
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
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
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="m19 6-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export function ProductionStepsEditor({
  steps,
  workCenters,
  onChange,
  onAdd,
  onRemove,
}: {
  steps: ProductionStepDraft[];
  workCenters: WorkCenter[];
  onChange: (id: string, patch: Partial<ProductionStepDraft>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section className="rounded-sm border border-[var(--border-soft)] bg-white p-6 shadow-[0_18px_48px_-28px_rgba(15,23,42,0.25)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Production planning
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Production Steps
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Order-level execution steps capture actual production effort separately from standard component production cost.
          </p>
        </div>
        <button type="button" className="app-button-primary" onClick={onAdd}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add step
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-muted)] px-4 py-3">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Active steps
          </div>
          <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{steps.length}</div>
        </div>
        <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-muted)] px-4 py-3">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Work centers
          </div>
          <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
            {new Set(steps.map((step) => step.workCenterId).filter(Boolean)).size}
          </div>
        </div>
        <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-muted)] px-4 py-3">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Actual effort
          </div>
          <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
            {steps.reduce((sum, step) => sum + (Number(step.timeHours) || 0), 0)} hrs
          </div>
        </div>
      </div>

      {steps.length === 0 ? (
        <div className="mt-5 rounded-sm border border-dashed border-[var(--border-soft)] bg-[var(--surface-muted)] px-4 py-8 text-sm text-[var(--text-secondary)]">
          This order has no explicit production steps yet. Add one or more work-center activities to improve ETA planning and execution visibility.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="rounded-sm border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(242,247,251,0.88))] p-5 shadow-[0_18px_32px_-28px_rgba(15,23,42,0.35)]"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Step {index + 1}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                    {step.stepName.trim() || "New production step"}
                  </div>
                </div>
                <button
                  type="button"
                  className="app-button-ghost text-rose-700 hover:bg-rose-50"
                  onClick={() => onRemove(step.id)}
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Remove
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="app-label">Step name</span>
                  <input
                    className="app-input"
                    value={step.stepName}
                    onChange={(event) => onChange(step.id, { stepName: event.target.value })}
                    placeholder="Panel Assembly"
                  />
                </label>
                <label className="space-y-2">
                  <span className="app-label">Work center</span>
                  <select
                    className="app-select"
                    value={step.workCenterId}
                    onChange={(event) => onChange(step.id, { workCenterId: event.target.value })}
                  >
                    <option value="">Select work center</option>
                    {workCenters.map((workCenter) => (
                      <option key={workCenter.id} value={workCenter.id}>
                        {workCenter.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="app-label">Description</span>
                  <textarea
                    className="app-textarea min-h-[96px]"
                    value={step.description}
                    onChange={(event) => onChange(step.id, { description: event.target.value })}
                    placeholder="Describe the work performed at this stage."
                  />
                </label>
                <label className="space-y-2">
                  <span className="app-label">Cost (NOK)</span>
                  <input
                    className="app-input"
                    type="number"
                    min="0"
                    value={step.cost}
                    onChange={(event) => onChange(step.id, { cost: event.target.value })}
                  />
                </label>
                <label className="space-y-2">
                  <span className="app-label">Time (hours)</span>
                  <input
                    className="app-input"
                    type="number"
                    min="0"
                    step="0.5"
                    value={step.timeHours}
                    onChange={(event) => onChange(step.id, { timeHours: event.target.value })}
                  />
                </label>
                <label className="space-y-2">
                  <span className="app-label">Status</span>
                  <select
                    className="app-select"
                    value={step.status}
                    onChange={(event) =>
                      onChange(step.id, {
                        status: event.target.value as ProductionStepDraft["status"],
                      })
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
