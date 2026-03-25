import { AppDialog } from "@/shared/ui/AppDialog";
import type { Category, Product } from "@/shared/types/domain";
import {
  createDraftId,
  type InlineComponentDraft,
} from "@/features/orders/model/orderHelpers";

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

export function InlineComponentDialog({
  open,
  draft,
  categories,
  products,
  saving,
  onClose,
  onChange,
  onSave,
}: {
  open: boolean;
  draft: InlineComponentDraft;
  categories: Category[];
  products: Product[];
  saving: boolean;
  onClose: () => void;
  onChange: (next: InlineComponentDraft) => void;
  onSave: () => void;
}) {
  const componentRows = draft.rows.filter((row) => row.productId && Number(row.quantity) > 0);
  const materialCost = componentRows.reduce((sum, row) => {
    const product = products.find((item) => item.id === row.productId);
    return sum + (product?.purchasePrice ?? 0) * (Number(row.quantity) || 0);
  }, 0);
  const standardProductionCost = Number(draft.standardProductionCost) || 0;
  const totalDerivedCost = materialCost + standardProductionCost;

  return (
    <AppDialog
      open={open}
      title="Configure Inline Component"
      description="Create a component from the order flow when ready-made stock is unavailable but the underlying products exist."
      size="xl"
      onClose={onClose}
      actions={
        <>
          <button type="button" className="app-button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="app-button-primary disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
              saving ||
              !draft.name.trim() ||
              !draft.sku.trim() ||
              !draft.categoryId ||
              componentRows.length === 0
            }
            onClick={onSave}
          >
            {saving ? "Saving..." : "Create component"}
          </button>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)]">
        <section className="space-y-4 rounded-[1.8rem] border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(244,248,252,0.92),rgba(255,255,255,1))] p-5">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Component identity
            </h3>
          </div>
          <label className="space-y-2">
            <span className="app-label">Component name</span>
            <input
              className="app-input"
              value={draft.name}
              onChange={(event) => onChange({ ...draft, name: event.target.value })}
              placeholder="Custom-CAB-004-V2"
            />
          </label>
          <label className="space-y-2">
            <span className="app-label">SKU</span>
            <input
              className="app-input"
              value={draft.sku}
              onChange={(event) => onChange({ ...draft, sku: event.target.value })}
              placeholder="LOV-COMP-NEW"
            />
          </label>
          <label className="space-y-2">
            <span className="app-label">Category</span>
            <select
              className="app-select"
              value={draft.categoryId}
              onChange={(event) => onChange({ ...draft, categoryId: event.target.value })}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="app-label">Unit</span>
            <input
              className="app-input"
              value={draft.unit}
              onChange={(event) => onChange({ ...draft, unit: event.target.value })}
            />
          </label>
          <label className="space-y-2">
            <span className="app-label">Standard production cost (NOK)</span>
            <input
              className="app-input"
              type="number"
              min="0"
              value={draft.standardProductionCost}
              onChange={(event) =>
                onChange({ ...draft, standardProductionCost: event.target.value })
              }
            />
          </label>
          <label className="space-y-2">
            <span className="app-label">Description</span>
            <textarea
              className="app-textarea min-h-[120px]"
              value={draft.description}
              onChange={(event) => onChange({ ...draft, description: event.target.value })}
              placeholder="Explain what this ad-hoc component is used for."
            />
          </label>
          <label className="flex items-start gap-3 rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-4 text-sm text-[var(--text-secondary)]">
            <input
              className="mt-1 h-4 w-4 rounded border-[var(--border-strong)] text-[var(--brand-900)]"
              type="checkbox"
              checked={draft.saveForFuture}
              onChange={(event) => onChange({ ...draft, saveForFuture: event.target.checked })}
            />
            <span>
              <span className="block font-semibold text-[var(--text-primary)]">
                Save to catalog for future use
              </span>
              <span className="mt-1 block">
                Unchecked components will still be created against the current mock service but can be marked inactive to avoid active-catalog reuse.
              </span>
            </span>
          </label>

          <div className="rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-4">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Derived cost visibility
            </div>
            <div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center justify-between gap-3">
                <span>Base materials</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  NOK {materialCost.toLocaleString("en-GB")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Production layer</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  NOK {standardProductionCost.toLocaleString("en-GB")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[var(--border-soft)] pt-2">
                <span className="font-semibold text-[var(--text-primary)]">Total derived cost</span>
                <span className="font-semibold text-[var(--brand-900)]">
                  NOK {totalDerivedCost.toLocaleString("en-GB")}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-[1.8rem] border border-[var(--border-soft)] bg-white p-5 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Composition editor
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Build the component from one or more base products.
              </p>
            </div>
            <button
              type="button"
              className="app-button-secondary"
              onClick={() =>
                onChange({
                  ...draft,
                  rows: [
                    ...draft.rows,
                    { id: createDraftId("component-row"), productId: "", quantity: "1" },
                  ],
                })
              }
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add product
            </button>
          </div>

          <div className="space-y-3">
            {draft.rows.map((row) => {
              const product = products.find((item) => item.id === row.productId);
              return (
                <div
                  key={row.id}
                  className="grid gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-4 md:grid-cols-[minmax(0,1fr)_120px_auto]"
                >
                  <label className="space-y-2">
                    <span className="app-label">Base product</span>
                    <select
                      className="app-select"
                      value={row.productId}
                      onChange={(event) =>
                        onChange({
                          ...draft,
                          rows: draft.rows.map((entry) =>
                            entry.id === row.id
                              ? { ...entry, productId: event.target.value }
                              : entry,
                          ),
                        })
                      }
                    >
                      <option value="">Select product</option>
                      {products.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.sku})
                        </option>
                      ))}
                    </select>
                    {product ? (
                      <div className="text-xs text-[var(--text-secondary)]">
                        Available: {Math.max(0, product.stockQuantity - product.reservedQuantity)}{" "}
                        {product.unit}
                      </div>
                    ) : null}
                  </label>

                  <label className="space-y-2">
                    <span className="app-label">Quantity</span>
                    <input
                      className="app-input"
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(event) =>
                        onChange({
                          ...draft,
                          rows: draft.rows.map((entry) =>
                            entry.id === row.id
                              ? { ...entry, quantity: event.target.value }
                              : entry,
                          ),
                        })
                      }
                    />
                  </label>

                  <div className="flex items-end">
                    <button
                      type="button"
                      className="app-button-ghost text-rose-700 hover:bg-rose-50"
                      onClick={() =>
                        onChange({
                          ...draft,
                          rows:
                            draft.rows.length > 1
                              ? draft.rows.filter((entry) => entry.id !== row.id)
                              : draft.rows,
                        })
                      }
                    >
                      <TrashIcon className="mr-2 h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)] px-4 py-4">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Calculated metrics
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  Base materials
                </div>
                <div className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                  NOK {materialCost.toLocaleString("en-GB")}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  Production layer
                </div>
                <div className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                  NOK {standardProductionCost.toLocaleString("en-GB")}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  Derived cost
                </div>
                <div className="mt-1 text-lg font-semibold text-[var(--brand-900)]">
                  NOK {totalDerivedCost.toLocaleString("en-GB")}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppDialog>
  );
}
