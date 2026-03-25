import { type ReactNode, useState } from "react";
import { Link } from "react-router-dom";

import {
  DataPanel,
  EmptyPanel,
  InventoryPageHeader,
} from "@/features/inventory/shared/InventoryScaffold";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { isDelayedOrder } from "@/features/orders/model/orderHelpers";
import { useCustomers, useOrders } from "@/services/hooks/useDomainQueries";
import { formatDate, formatNok } from "@/shared/lib/format";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";

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

function ChartIcon({ className }: { className?: string }) {
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
      <path d="M4 19h16" />
      <path d="M7 15v-4" />
      <path d="M12 15V8" />
      <path d="M17 15v-7" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
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
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 9v4" />
      <circle cx="12" cy="16.5" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
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
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function RegistryMetricCard({
  label,
  value,
  supporting,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  supporting: string;
  icon: ReactNode;
  tone?: "default" | "brand" | "warning";
}) {
  return (
    <div
      className={[
        "flex min-h-[10.5rem] flex-col justify-between rounded-[1.8rem] border p-5 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.25)]",
        tone === "brand" &&
          "border-[var(--brand-700)] bg-[var(--brand-900)] text-white",
        tone === "warning" && "border-amber-300 bg-amber-50",
        tone === "default" &&
          "border-[var(--border-soft)] bg-white text-[var(--text-primary)]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={[
            "text-[11px] font-extrabold uppercase tracking-[0.22em]",
            tone === "brand" ? "text-white/70" : "text-[var(--text-muted)]",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {label}
        </div>
        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
            tone === "brand"
              ? "border-white/20 bg-white/10 text-white"
              : tone === "warning"
                ? "border-amber-300 bg-white text-amber-700"
                : "border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--brand-900)]",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {icon}
        </div>
      </div>
      <div className="space-y-3">
        <div
          className={[
            "text-[clamp(1.9rem,2vw,2.4rem)] font-black leading-none tracking-[-0.03em]",
            tone === "warning" && "text-amber-900",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {value}
        </div>
        <div className={tone === "brand" ? "text-sm text-white/80" : "text-sm text-[var(--text-secondary)]"}>
          {supporting}
        </div>
      </div>
    </div>
  );
}

type EtaStatusTone = "delayed" | "atRisk" | "onTrack" | "unplanned";

function getEtaStatus(order: {
  promisedEta: string | null;
  materialAvailabilityEta: string | null;
  orderDate: string;
}) {
  if (!order.promisedEta) {
    return {
      label: "Needs commitment",
      tone: "unplanned" as EtaStatusTone,
    };
  }

  const promisedTime = new Date(order.promisedEta).getTime();
  const materialTime = order.materialAvailabilityEta
    ? new Date(order.materialAvailabilityEta).getTime()
    : null;

  if (promisedTime < Date.now()) {
    return { label: "Delayed", tone: "delayed" as EtaStatusTone };
  }

  if (materialTime && materialTime > new Date(order.orderDate).getTime()) {
    return { label: "Inbound risk", tone: "atRisk" as EtaStatusTone };
  }

  return { label: "On track", tone: "onTrack" as EtaStatusTone };
}

function EtaStatusBadge({ tone, label }: { tone: EtaStatusTone; label: string }) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em]",
        tone === "delayed" && "border-rose-200 bg-rose-100 text-rose-700",
        tone === "atRisk" && "border-amber-200 bg-amber-100 text-amber-800",
        tone === "onTrack" && "border-emerald-200 bg-emerald-100 text-emerald-700",
        tone === "unplanned" && "border-slate-200 bg-slate-100 text-slate-700",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </span>
  );
}

export function OrdersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [delayedOnly, setDelayedOnly] = useState(false);
  const [renderedAt] = useState(() => Date.now());

  const customersQuery = useCustomers();
  const ordersQuery = useOrders();
  const isLoading = customersQuery.isLoading || ordersQuery.isLoading;
  const isError = customersQuery.isError || ordersQuery.isError;
  const customers = customersQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const customerLookup = new Map(customers.map((customer) => [customer.id, customer]));
  const needle = query.trim().toLowerCase();
  const rows = orders.filter((order) => {
    if (
      needle &&
      ![order.orderNumber, order.notes, customerLookup.get(order.customerId)?.name]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    ) {
      return false;
    }

    if (status && order.status !== status) {
      return false;
    }

    if (delayedOnly && !isDelayedOrder(order)) {
      return false;
    }

    return true;
  });

  if (isLoading) {
    return <LoadingState label="Loading active orders..." />;
  }

  if (isError) {
    return <ErrorState title="Could not load the order register." />;
  }

  const delayedOrders = rows.filter((order) => isDelayedOrder(order)).length;
  const inProduction = rows.filter((order) => order.status === "in_production").length;
  const awaitingMaterials = rows.filter(
    (order) =>
      (order.status === "confirmed" || order.status === "reserved") &&
      Boolean(order.materialAvailabilityEta) &&
      new Date(order.materialAvailabilityEta as string).getTime() > renderedAt,
  ).length;
  const totalRevenue = rows.reduce((sum, order) => sum + order.grandTotal, 0);
  const totalProfit = rows.reduce((sum, order) => sum + order.profitTotal, 0);
  const averageLeadTime = rows.reduce((sum, order) => {
    if (!order.deliveryEta) return sum;
    const diff =
      new Date(order.deliveryEta).getTime() - new Date(order.orderDate).getTime();
    return sum + Math.max(0, Math.round(diff / 86_400_000));
  }, 0);
  const leadTimeCount = rows.filter((order) => Boolean(order.deliveryEta)).length;
  const avgLeadTimeValue = leadTimeCount
    ? `${(averageLeadTime / leadTimeCount).toFixed(1)} days`
    : "Pending";
  const openOrders = rows.filter(
    (order) => !["cancelled", "delivered"].includes(order.status),
  ).length;

  return (
    <div className="app-page space-y-6">
      <InventoryPageHeader
        eyebrow="Sales / Orders"
        title="Order registry"
        description="Track Lovold orders from draft through delivery, with reservation-aware status, stored promised ETA, and production readiness."
        actions={
          <Link className="app-button-primary" to="/orders/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create order
          </Link>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_repeat(3,minmax(0,1fr))]">
        <div className="flex min-h-[12rem] flex-col justify-between rounded-[1.8rem] border border-[var(--border-soft)] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(233,244,252,0.92))] p-5 shadow-[0_18px_48px_-28px_rgba(15,23,42,0.35)]">
          <div className="space-y-2">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Active orders
            </div>
            <div className="text-2xl font-black tracking-[-0.03em] text-[var(--text-primary)]">
              Real-time commercial control
            </div>
            <p className="max-w-sm text-sm text-[var(--text-secondary)]">
              Manage aquaculture orders through reservation, production, delivery, and promised ETA risk in one operational register.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link className="app-button-primary" to="/orders/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              Create new order
            </Link>
            <div className="rounded-full border border-[var(--border-soft)] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              {openOrders} open workflow(s)
            </div>
          </div>
        </div>

        <RegistryMetricCard
          label="Total order value"
          value={formatNok(totalRevenue)}
          supporting="Filtered commercial exposure in the active register."
          icon={<ChartIcon className="h-5 w-5" />}
          tone="brand"
        />
        <RegistryMetricCard
          label="Avg. lead time"
          value={avgLeadTimeValue}
          supporting="Measured from order date to current delivery ETA."
          icon={<ClockIcon className="h-5 w-5" />}
        />
        <RegistryMetricCard
          label="ETA risks"
          value={String(delayedOrders)}
          supporting={`${awaitingMaterials} order(s) currently waiting on materials.`}
          icon={<WarningIcon className="h-5 w-5" />}
          tone="warning"
        />
      </section>

      <DataPanel
        title="Registry controls"
        description="Use the search and quick filters to narrow the live order board by lifecycle status and delivery risk."
      >
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-[18rem] flex-1 space-y-2">
            <span className="app-label">Search order, customer, or notes</span>
            <input
              className="app-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ORD-2026-3002 or FjordBlue..."
            />
          </label>
          <label className="min-w-[12rem] space-y-2">
            <span className="app-label">Lifecycle</span>
            <select
              className="app-select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="confirmed">Confirmed</option>
              <option value="reserved">Reserved</option>
              <option value="in_production">In production</option>
              <option value="ready">Ready</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label className="flex min-h-[3rem] items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3">
            <input
              type="checkbox"
              checked={delayedOnly}
              onChange={(event) => setDelayedOnly(event.target.checked)}
            />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Delayed orders only
            </span>
          </label>
        </div>

        <div className="grid gap-3 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3">
            <div className="app-label">Awaiting materials</div>
            <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
              {awaitingMaterials}
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3">
            <div className="app-label">Estimated profit</div>
            <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
              {formatNok(totalProfit)}
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3">
            <div className="app-label">Inventory reservation</div>
            <div className="mt-2 text-sm text-[var(--text-secondary)]">
              Reservation occurs at confirmation and continues through dispatch.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-stretch lg:justify-end">
            {[
              { label: "In production", value: inProduction },
              { label: "Delayed", value: delayedOrders },
              { label: "Open", value: openOrders },
            ].map((chip) => (
              <div
                key={chip.label}
                className="rounded-full border border-[var(--border-soft)] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]"
              >
                {chip.label} <span className="ml-2 text-[var(--text-primary)]">{chip.value}</span>
              </div>
            ))}
          </div>
        </div>
      </DataPanel>

      {rows.length === 0 ? (
        <EmptyPanel
          title="No orders match these filters"
          copy="Try widening the search or clearing one of the active filters."
          action={
            <Link className="app-button-primary" to="/orders/new">
              Create order
            </Link>
          }
        />
      ) : (
        <DataPanel
          title="Active order board"
          description="Operational register of customer commitments, ETA exposure, profit, and lifecycle progression across products and components."
        >
          <div className="app-table-shell">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Ordered</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Profit</th>
                  <th>Promised ETA</th>
                  <th>ETA status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((order) => {
                  const delayed = isDelayedOrder(order);
                  const etaStatus = getEtaStatus(order);

                  return (
                    <tr key={order.id}>
                      <td>
                        <div className="space-y-1">
                          <div className="font-semibold text-[var(--text-primary)]">
                            {order.orderNumber}
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">
                            {order.notes || "Commercial order"}
                          </div>
                        </div>
                      </td>
                      <td>{customerLookup.get(order.customerId)?.name ?? "Unknown customer"}</td>
                      <td className="text-sm text-[var(--text-secondary)]">
                        {formatDate(order.orderDate)}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <OrderStatusBadge status={order.status} />
                          {delayed ? (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                              delayed
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td>{order.itemCount}</td>
                      <td>{formatNok(order.grandTotal)}</td>
                      <td>{formatNok(order.profitTotal)}</td>
                      <td>{order.promisedEta ? formatDate(order.promisedEta) : "TBD"}</td>
                      <td>
                        <EtaStatusBadge tone={etaStatus.tone} label={etaStatus.label} />
                      </td>
                      <td className="text-right">
                        <Link
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-900)] hover:underline"
                          to={`/orders/${order.id}`}
                        >
                          Open
                          <ChevronRightIcon className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DataPanel>
      )}
    </div>
  );
}
