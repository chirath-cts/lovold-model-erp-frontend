import type {
  Component,
  ComponentProduct,
  CustomerProduct,
  Product,
} from "@/shared/types/domain";
import { CurrencyText } from "@/shared/ui/CurrencyText";
import type {
  ComponentBreakdownRow,
  OrderLineDraft,
  ResolvedOrderLine,
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

function CubeIcon({ className }: { className?: string }) {
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
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="M12 12 4 7.5" />
      <path d="M12 12l8-4.5" />
      <path d="M12 12v9" />
    </svg>
  );
}

function NetworkIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="5" r="2.2" />
      <circle cx="6" cy="18" r="2.2" />
      <circle cx="18" cy="18" r="2.2" />
      <path d="M12 7.5v4" />
      <path d="m10.1 10.9-3 5" />
      <path d="m13.9 10.9 3 5" />
      <path d="M8.3 18h7.4" />
    </svg>
  );
}

function BreakdownTable({
  rows,
  showAvailability = false,
}: {
  rows: ComponentBreakdownRow[];
  showAvailability?: boolean;
}) {
  if (!rows.length) return null;

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white">
      <table className="app-table">
        <thead>
          <tr>
            <th>Base product</th>
            <th>SKU</th>
            <th>Qty / unit</th>
            <th>Total qty</th>
            {showAvailability ? <th>Available</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.productId}>
              <td>{row.productName}</td>
              <td className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                {row.productSku}
              </td>
              <td>{row.quantityPerUnit}</td>
              <td>{row.totalQuantity}</td>
              {showAvailability ? <td>{row.availableQuantity}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OrderLineBuilder({
  customerId,
  lines,
  resolvedLines,
  products,
  components,
  componentProducts,
  customerProducts,
  onAddProduct,
  onAddComponent,
  onCreateInlineComponent,
  onChange,
  onRemove,
}: {
  customerId: string;
  lines: OrderLineDraft[];
  resolvedLines: ResolvedOrderLine[];
  products: Product[];
  components: Component[];
  componentProducts: ComponentProduct[];
  customerProducts: CustomerProduct[];
  onAddProduct: () => void;
  onAddComponent: () => void;
  onCreateInlineComponent: () => void;
  onChange: (id: string, patch: Partial<OrderLineDraft>) => void;
  onRemove: (id: string) => void;
}) {
  const resolvedLookup = new Map(resolvedLines.map((line) => [line.id, line]));
  const productLookup = new Map(products.map((product) => [product.id, product]));
  const componentLookup = new Map(components.map((component) => [component.id, component]));

  return (
    <section className="rounded-[1.9rem] border border-[var(--border-soft)] bg-white p-6 shadow-[0_18px_48px_-28px_rgba(15,23,42,0.25)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Line items
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Order commercial workspace
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Add products and components separately. Components behave as single sellable units but always expose their base-product breakdown.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="app-button-secondary" onClick={onAddProduct}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add product
          </button>
          <button type="button" className="app-button-primary" onClick={onAddComponent}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add component
          </button>
          <button type="button" className="app-button-ghost" onClick={onCreateInlineComponent}>
            Create inline component
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)] px-4 py-3">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Product lines
          </div>
          <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
            {lines.filter((line) => line.itemType === "product").length}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)] px-4 py-3">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Component lines
          </div>
          <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
            {lines.filter((line) => line.itemType === "component").length}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)] px-4 py-3">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Pricing agreements
          </div>
          <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
            {customerId
              ? customerProducts.filter((agreement) => agreement.customerId === customerId).length
              : 0}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {lines.map((line, index) => {
          const resolved = resolvedLookup.get(line.id);
          const selectedProduct = line.itemType === "product" ? productLookup.get(line.itemId) : undefined;
          const selectedComponent = line.itemType === "component" ? componentLookup.get(line.itemId) : undefined;
          const componentRows = line.itemType === "component"
            ? componentProducts.filter((row) => row.componentId === line.itemId)
            : [];

          return (
            <div
              key={line.id}
              className="rounded-[1.75rem] border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(242,247,251,0.88))] p-5 shadow-[0_18px_32px_-28px_rgba(15,23,42,0.4)]"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-4">
                  <div
                    className={[
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
                      line.itemType === "product"
                        ? "border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--brand-900)]"
                        : "border-sky-200 bg-sky-50 text-sky-700",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {line.itemType === "product" ? (
                      <CubeIcon className="h-5 w-5" />
                    ) : (
                      <NetworkIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Line {index + 1}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${line.itemType === "product" ? "bg-[var(--brand-100)] text-[var(--brand-900)]" : "bg-sky-100 text-sky-800"}`}>
                        {line.itemType}
                      </span>
                      {resolved ? (
                        <span className="text-base font-semibold text-[var(--text-primary)]">
                          {resolved.itemName}
                        </span>
                      ) : (
                        <span className="text-base font-semibold text-[var(--text-primary)]">
                          {line.itemType === "product"
                            ? "Select a base product"
                            : "Select a sellable component"}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      {line.itemType === "product"
                        ? "Direct sales line using customer-specific product pricing when available."
                        : "Composite sales line with visible product breakdown for material planning."}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="app-button-ghost text-rose-700 hover:bg-rose-50"
                  onClick={() => onRemove(line.id)}
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Remove
                </button>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,0.8fr))]">
                <label className="space-y-2 xl:col-span-2">
                  <span className="app-label">
                    {line.itemType === "product" ? "Product" : "Component"}
                  </span>
                  <select
                    className="app-select"
                    value={line.itemId}
                    onChange={(event) => onChange(line.id, { itemId: event.target.value })}
                  >
                    <option value="">
                      Select {line.itemType === "product" ? "product" : "component"}
                    </option>
                    {(line.itemType === "product" ? products : components).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.sku})
                      </option>
                    ))}
                  </select>
                  {line.itemType === "product" && selectedProduct ? (
                    <div className="text-xs text-[var(--text-secondary)]">
                      Available: {Math.max(0, selectedProduct.stockQuantity - selectedProduct.reservedQuantity)}{" "}
                      {selectedProduct.unit}
                    </div>
                  ) : null}
                  {line.itemType === "component" && selectedComponent ? (
                    <div className="text-xs text-[var(--text-secondary)]">
                      Ready-made available: {Math.max(0, selectedComponent.stockQuantity - selectedComponent.reservedQuantity)}{" "}
                      {selectedComponent.unit} • {componentRows.length} BOM rows
                    </div>
                  ) : null}
                </label>

                <label className="space-y-2">
                  <span className="app-label">Quantity</span>
                  <input
                    className="app-input"
                    type="number"
                    min="1"
                    value={line.quantity}
                    onChange={(event) => onChange(line.id, { quantity: event.target.value })}
                  />
                </label>

                <label className="space-y-2">
                  <span className="app-label">Discount type</span>
                  <select
                    className="app-select"
                    value={line.discountType}
                    onChange={(event) =>
                      onChange(line.id, {
                        discountType: event.target.value as OrderLineDraft["discountType"],
                      })
                    }
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed amount</option>
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="app-label">
                    {line.discountType === "percentage" ? "Discount %" : "Discount / unit"}
                  </span>
                  <input
                    className="app-input"
                    type="number"
                    min="0"
                    value={line.discountValue}
                    onChange={(event) => onChange(line.id, { discountValue: event.target.value })}
                  />
                </label>

                <div className="space-y-2 xl:col-span-2">
                  <span className="app-label">Pricing source</span>
                  <label className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm text-[var(--text-secondary)]">
                    <input
                      className="h-4 w-4 rounded border-[var(--border-strong)] text-[var(--brand-900)]"
                      type="checkbox"
                      checked={line.overrideUnitPrice}
                      onChange={(event) =>
                        onChange(line.id, { overrideUnitPrice: event.target.checked })
                      }
                    />
                    <span>
                      <span className="block font-semibold text-[var(--text-primary)]">
                        Manual unit price override
                      </span>
                      <span className="mt-1 block">
                        {customerId
                          ? "Derived pricing uses customer-specific product agreements where available."
                          : "Select a customer first to preview agreement-driven pricing."}
                      </span>
                    </span>
                  </label>
                </div>

                {line.overrideUnitPrice ? (
                  <label className="space-y-2 xl:col-span-2">
                    <span className="app-label">Manual unit price (NOK)</span>
                    <input
                      className="app-input"
                      type="number"
                      min="0"
                      value={line.manualUnitPrice}
                      onChange={(event) =>
                        onChange(line.id, { manualUnitPrice: event.target.value })
                      }
                    />
                  </label>
                ) : null}
              </div>

              {resolved ? (
                <div className="mt-5 grid gap-3 xl:grid-cols-5">
                  <div className="rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      Unit price
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                      <CurrencyText value={resolved.unitPrice} />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      Subtotal
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                      <CurrencyText value={resolved.lineSubtotal} />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      Discount
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                      <CurrencyText value={resolved.discountAmount} />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      Line total
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[var(--brand-900)]">
                      <CurrencyText value={resolved.lineTotal} />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      Profit
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                      <CurrencyText value={resolved.profitAmount} />
                    </div>
                  </div>
                </div>
              ) : null}

              {resolved?.itemType === "component" ? (
                <div className="mt-5 rounded-2xl border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(230,244,255,0.82),rgba(244,249,252,0.96))] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                        Underlying product breakdown
                      </h3>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        Components remain visible as single sellable lines, but Lovold still needs to see the product composition for fulfillment and costing.
                      </p>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      Manual override: {resolved.usesManualUnitPrice ? "Yes" : "No"}
                    </div>
                  </div>
                  <BreakdownTable rows={resolved.componentBreakdown} showAvailability />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {customerId ? (
        <div className="mt-5 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)] px-4 py-4 text-sm text-[var(--text-secondary)]">
          Product pricing agreements currently loaded:{" "}
          <span className="font-semibold text-[var(--text-primary)]">
            {customerProducts.filter((agreement) => agreement.customerId === customerId).length}
          </span>
          . Components do not have direct pricing agreements and derive pricing from their base products plus standard production cost.
        </div>
      ) : null}
    </section>
  );
}
