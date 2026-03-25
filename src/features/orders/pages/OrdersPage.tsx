import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { EmptyPanel } from "@/features/inventory/shared/InventoryScaffold";
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

function EtaStatusBadge({ tone }: { tone: EtaStatusTone }) {
  return (
    <div className="flex items-center gap-1.5">
      {tone === "delayed" && (
        <>
          <svg
            className="h-4 w-4 text-red-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
          </svg>
          <span className="text-[10px] font-bold text-red-600 uppercase">
            Delayed
          </span>
        </>
      )}
      {tone === "atRisk" && (
        <>
          <svg
            className="h-4 w-4 text-amber-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
          <span className="text-[10px] font-bold text-amber-600 uppercase">
            At Risk
          </span>
        </>
      )}
      {tone === "onTrack" && (
        <>
          <svg
            className="h-4 w-4 text-emerald-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span className="text-[10px] font-bold text-emerald-600 uppercase">
            On Track
          </span>
        </>
      )}
      {tone === "unplanned" && (
        <>
          <svg
            className="h-4 w-4 text-slate-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M13 13h-2v-2h2v2zm0 8h-2v-2h2v2zm0-4h-2v-2h2v2z" />
          </svg>
          <span className="text-[10px] font-bold text-slate-600 uppercase">
            Needs commitment
          </span>
        </>
      )}
    </div>
  );
}

export function OrdersPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [delayedOnly, setDelayedOnly] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const customersQuery = useCustomers();
  const ordersQuery = useOrders();
  const isLoading = customersQuery.isLoading || ordersQuery.isLoading;
  const isError = customersQuery.isError || ordersQuery.isError;
  const customers = customersQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const customerLookup = new Map(
    customers.map((customer) => [customer.id, customer]),
  );
  const needle = query.trim().toLowerCase();
  const rows = orders.filter((order) => {
    if (
      needle &&
      ![
        order.orderNumber,
        order.notes,
        customerLookup.get(order.customerId)?.name,
      ]
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
  const totalRevenue = rows.reduce((sum, order) => sum + order.grandTotal, 0);
  const averageLeadTime = rows.reduce((sum, order) => {
    if (!order.deliveryEta) return sum;
    const diff =
      new Date(order.deliveryEta).getTime() -
      new Date(order.orderDate).getTime();
    return sum + Math.max(0, Math.round(diff / 86_400_000));
  }, 0);
  const leadTimeCount = rows.filter((order) =>
    Boolean(order.deliveryEta),
  ).length;
  const avgLeadTimeValue = leadTimeCount
    ? `${(averageLeadTime / leadTimeCount).toFixed(1)} days`
    : "Pending";

  // Calculate order distribution by status
  const inProduction = rows.filter(
    (order) => order.status === "in_production",
  ).length;
  const reserved = rows.filter((order) => order.status === "reserved").length;
  const ready = rows.filter((order) => order.status === "ready").length;
  const other = rows.filter(
    (order) => !["in_production", "reserved", "ready"].includes(order.status),
  ).length;
  const totalOrders = rows.length;

  const productionPercent =
    totalOrders > 0 ? Math.round((inProduction / totalOrders) * 100) : 0;
  const reservedPercent =
    totalOrders > 0 ? Math.round((reserved / totalOrders) * 100) : 0;
  const readyPercent =
    totalOrders > 0 ? Math.round((ready / totalOrders) * 100) : 0;
  const otherPercent =
    totalOrders > 0 ? Math.round((other / totalOrders) * 100) : 0;

  // Calculate trend - comparing delayed orders ratio
  const delayedRatio =
    totalOrders > 0 ? (delayedOrders / totalOrders) * 100 : 0;

  return (
    <div className="app-page space-y-6">
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 flex flex-col justify-between p-4 rounded-sm bg-slate-100">
          <div>
            <h2 className="text-slate-700 font-bold text-lg tracking-tight">
              Active Orders
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Real-time procurement tracking
            </p>
          </div>
          <Link
            to="/orders/new"
            style={{ color: "white" }}
            className="mt-4 bg-gradient-to-r from-[#004260] to-[#005b82] text-white py-2 px-4 rounded-sm text-sm font-semibold flex items-center justify-center gap-2 hover:from-[#003050] hover:to-[#004565] active:scale-[0.98] transition-all"
          >
            <PlusIcon className="h-4 w-4" />
            Create New Order
          </Link>
        </div>

        <div className="p-4 bg-white rounded-sm flex flex-col justify-between shadow-[0_4px_24px_-4px_rgba(25,28,30,0.06)]">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Total Orders Value
            </span>
            <ChartIcon className="h-5 w-5 text-slate-400 opacity-40" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-800 font-mono">
              {formatNok(totalRevenue)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-7"
              />
            </svg>
            14% vs Last Month
          </div>
        </div>

        <div className="p-4 bg-white rounded-sm flex flex-col justify-between shadow-[0_4px_24px_-4px_rgba(25,28,30,0.06)]">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Avg. Lead Time
            </span>
            <ClockIcon className="h-5 w-5 text-slate-400 opacity-40" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-800 font-mono">
              {avgLeadTimeValue.split(" ")[0]}
            </span>
            <span className="text-xs font-bold text-slate-400 ml-1">
              {avgLeadTimeValue.split(" ")[1]}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500 font-bold">
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Optimal target: 12 days
          </div>
        </div>

        <div className="p-4 bg-white rounded-sm border-l-4 border-red-400 flex flex-col justify-between shadow-[0_4px_24px_-4px_rgba(25,28,30,0.06)]">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              ETA Risks
            </span>
            <WarningIcon className="h-5 w-5 text-red-600 opacity-60" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-red-600 font-mono">
              {delayedOrders}
            </span>
            <span className="text-xs font-bold text-slate-400 ml-1">
              Orders
            </span>
          </div>
          <div className="mt-2 text-[10px] text-red-600 font-bold">
            Critical attention required
          </div>
        </div>
      </section>

      <section className="bg-slate-100 p-3 rounded-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-sm border-b-2 border-transparent focus-within:border-slate-800 transition-all shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">
            Status:
          </span>
          <select
            className="border-none text-xs font-bold text-slate-800 bg-transparent p-0 focus:ring-0 cursor-pointer"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="confirmed">Confirmed</option>
            <option value="reserved">Reserved</option>
            <option value="in_production">In Production</option>
            <option value="ready">Ready</option>
            <option value="dispatched">Dispatched</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-sm border-b-2 border-transparent focus-within:border-slate-800 transition-all shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">
            Search:
          </span>
          <input
            type="text"
            className="border-none text-xs font-bold text-slate-800 bg-transparent p-0 focus:ring-0 placeholder:text-slate-400"
            placeholder="Order, customer, or notes"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-sm border-b-2 border-transparent focus-within:border-slate-800 transition-all shadow-sm cursor-pointer">
          <input
            type="checkbox"
            checked={delayedOnly}
            onChange={(event) => setDelayedOnly(event.target.checked)}
            className="rounded cursor-pointer"
          />
          <span className="text-xs font-bold text-slate-800 uppercase">
            Delayed Only
          </span>
        </label>

        <div className="ml-auto flex items-center gap-2">
          <button className="p-2 text-slate-600 hover:bg-white rounded-sm transition-colors">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>
          <button className="p-2 text-slate-600 hover:bg-white rounded-sm transition-colors">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </button>
        </div>
      </section>

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
        <section className="bg-white rounded-sm overflow-hidden shadow-[0_4px_24px_-4px_rgba(25,28,30,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700">
                    Order #
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700">
                    Order Date
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700">
                    Items
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 text-right">
                    Total Value (NOK)
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 text-right">
                    Est. Profit
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700">
                    Promised ETA
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700">
                    ETA Status
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((order) => {
                  const etaStatus = getEtaStatus(order);

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <td className="px-4 py-4 text-xs font-mono font-bold text-slate-800">
                        #{order.orderNumber}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-sm font-semibold text-slate-800">
                            {customerLookup.get(order.customerId)?.name ??
                              "Unknown customer"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="px-4 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600 font-medium">
                        {order.itemCount}
                      </td>
                      <td className="px-4 py-4 text-xs font-mono font-bold text-right text-slate-800">
                        {formatNok(order.grandTotal)}
                      </td>
                      <td className="px-4 py-4 text-xs font-mono text-emerald-600 text-right font-semibold">
                        {formatNok(order.profitTotal)}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">
                        {order.promisedEta
                          ? formatDate(order.promisedEta)
                          : "TBD"}
                      </td>
                      <td className="px-4 py-4">
                        <EtaStatusBadge tone={etaStatus.tone} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded-sm transition-all inline-flex"
                          to={`/orders/${order.id}`}
                        >
                          <svg
                            className="h-5 w-5 text-slate-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 5v14m0 0l-7-7m7 7l7-7"
                            />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-100 flex items-center justify-between border-t border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Showing 1-{rows.length} of {orders.length} active orders
            </span>
            <div className="flex items-center gap-1">
              <button
                className="p-1 hover:bg-white rounded-sm disabled:opacity-30"
                disabled
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="flex items-center gap-1 mx-2">
                <span className="w-6 h-6 flex items-center justify-center bg-slate-800 text-white text-[10px] font-bold rounded-sm">
                  1
                </span>
              </div>
              <button className="p-1 hover:bg-white rounded-sm">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Bottom Visualization (Secondary Context) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-100 p-4 rounded-sm flex items-center gap-6">
          <div className="flex-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 mb-2">
              Order Distribution
            </h3>
            <div className="flex h-4 w-full rounded-full overflow-hidden bg-slate-200">
              <div
                className="h-full bg-[#004260]"
                style={{ width: `${productionPercent}%` }}
              ></div>
              <div
                className="h-full bg-amber-500"
                style={{ width: `${reservedPercent}%` }}
              ></div>
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${readyPercent}%` }}
              ></div>
              <div
                className="h-full bg-slate-400"
                style={{ width: `${otherPercent}%` }}
              ></div>
            </div>
            <div className="mt-3 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#004260]"></div>
                <span className="text-[10px] font-bold text-slate-600">
                  Production ({productionPercent}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-[10px] font-bold text-slate-600">
                  Reserved ({reservedPercent}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-bold text-slate-600">
                  Ready ({readyPercent}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                <span className="text-[10px] font-bold text-slate-600">
                  Other ({otherPercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-sm border border-blue-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#004260] mb-1">
              Operational Highlight
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {(delayedRatio as number) > 15
                ? `System flagged ${delayedRatio}% of orders with ETA risk. Recommend prioritizing material sourcing and production scheduling.`
                : `Current order fulfillment is on track with only ${delayedRatio}% at-risk orders. Continue operational momentum.`}
            </p>
          </div>
          <svg
            className="h-8 w-8 text-[#004260] opacity-20"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
      </section>
    </div>
  );
}
