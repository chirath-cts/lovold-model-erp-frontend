import { useMutation } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { queryClient } from "@/app/queryClient";
import { OrderEtaPanel } from "@/features/orders/components/OrderEtaPanel";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { OrderStatusTimeline } from "@/features/orders/components/OrderStatusTimeline";
import {
  buildComponentBreakdownFromOrderItem,
  buildOrderDetailSummary,
  getNextOrderStatus,
} from "@/features/orders/model/orderHelpers";
import { DataPanel, FieldGrid } from "@/features/inventory/shared/InventoryScaffold";
import { ordersService } from "@/services/endpoints/ordersService";
import {
  useBusinessSettings,
  useComponentProducts,
  useComponents,
  useCustomerById,
  useCustomerProducts,
  useOrderById,
  useOrderItems,
  useOrderProductionSteps,
  useProducts,
  useWorkCenters,
} from "@/services/hooks/useDomainQueries";
import { queryKeys } from "@/shared/constants/queryKeys";
import { formatDate, formatNok } from "@/shared/lib/format";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import type { OrderStatus } from "@/shared/types/domain";

function SnapshotCard({
  label,
  value,
  supporting,
  tone = "default",
}: {
  label: string;
  value: string;
  supporting: string;
  tone?: "default" | "brand" | "warning";
}) {
  return (
    <div
      className={[
        "rounded-sm border p-4 shadow-[0_4px_24px_-8px_rgba(25,28,30,0.1)] transition-transform duration-150 hover:-translate-y-0.5",
        tone === "brand" &&
          "bg-gradient-to-r from-[#004260] to-[#005b82] border-transparent text-white",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-900",
        tone === "default" && "border-slate-200 bg-white text-slate-900",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "text-[10px] font-black uppercase tracking-[0.2em]",
          tone === "brand"
            ? "text-white/80"
            : tone === "warning"
              ? "text-amber-800"
              : "text-slate-500",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label}
      </div>
      <div
        className={[
          "mt-3 text-2xl font-black leading-tight tracking-[-0.02em]",
          tone === "brand" && "text-white",
          tone === "warning" && "text-amber-900",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </div>
      <p
        className={[
          "mt-2 text-sm",
          tone === "brand"
            ? "text-white/80"
            : tone === "warning"
              ? "text-amber-800/90"
              : "text-slate-600",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {supporting}
      </p>
    </div>
  );
}

export function OrderDetailPage() {
  const { orderId = "" } = useParams();

  const orderQuery = useOrderById(orderId);
  const orderItemsQuery = useOrderItems(orderId);
  const orderProductionStepsQuery = useOrderProductionSteps(orderId);
  const productsQuery = useProducts();
  const componentsQuery = useComponents();
  const componentProductsQuery = useComponentProducts();
  const customerProductsQuery = useCustomerProducts();
  const workCentersQuery = useWorkCenters();
  const businessSettingsQuery = useBusinessSettings();
  const customerQuery = useCustomerById(orderQuery.data?.customerId);

  const updateOrderMutation = useMutation({
    mutationFn: (status: OrderStatus) => ordersService.update(orderId, { status }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.orders }),
        queryClient.invalidateQueries({ queryKey: queryKeys.orderItems }),
        queryClient.invalidateQueries({ queryKey: queryKeys.orderProductionSteps }),
        queryClient.invalidateQueries({ queryKey: queryKeys.products }),
        queryClient.invalidateQueries({ queryKey: queryKeys.components }),
      ]);
    },
  });

  const isLoading =
    orderQuery.isLoading ||
    orderItemsQuery.isLoading ||
    orderProductionStepsQuery.isLoading ||
    productsQuery.isLoading ||
    componentsQuery.isLoading ||
    componentProductsQuery.isLoading ||
    customerProductsQuery.isLoading ||
    workCentersQuery.isLoading ||
    businessSettingsQuery.isLoading ||
    (orderQuery.data?.customerId ? customerQuery.isLoading : false);

  const isError =
    orderQuery.isError ||
    orderItemsQuery.isError ||
    orderProductionStepsQuery.isError ||
    productsQuery.isError ||
    componentsQuery.isError ||
    componentProductsQuery.isError ||
    customerProductsQuery.isError ||
    workCentersQuery.isError ||
    businessSettingsQuery.isError ||
    customerQuery.isError;
  const order = orderQuery.data ?? null;

  const items = orderItemsQuery.data ?? [];
  const steps = orderProductionStepsQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const components = componentsQuery.data ?? [];
  const componentProducts = componentProductsQuery.data ?? [];
  const customerProducts = customerProductsQuery.data ?? [];
  const workCenters = workCentersQuery.data ?? [];
  const businessSettings = businessSettingsQuery.data ?? {
    qualityCheckLeadDays: 0,
    packagingLeadDays: 0,
  };
  const customer = customerQuery.data;
  const workCenterLookup = new Map(workCenters.map((workCenter) => [workCenter.id, workCenter]));

  const orderSummary = order
    ? buildOrderDetailSummary(order, items, steps, workCenters, customer)
    : {
        customerName: "Unknown customer",
        totalLines: 0,
        productionCost: 0,
        totalHours: 0,
        workCentersInUse: [],
        delayed: false,
      };

  const enrichedItems = order
    ? items.map((item) => ({
        ...item,
        breakdown: buildComponentBreakdownFromOrderItem({
          item,
          components,
          componentProducts,
          products,
          customerProducts,
          orderDate: order.orderDate,
          customerId: order.customerId,
        }),
      }))
    : [];

  if (isLoading) {
    return <LoadingState label="Loading order tracking..." />;
  }

  if (isError) {
    return <ErrorState title="Could not load the order detail." />;
  }

  if (!order) {
    return <ErrorState title="Order not found." />;
  }

  const nextStatus = getNextOrderStatus(order.status);
  const waitingOnInbound =
    Boolean(order.materialAvailabilityEta) && order.materialAvailabilityEta !== order.orderDate;
  const etaBlockers = [
    orderSummary.delayed ? "Promised ETA has already passed and needs attention." : null,
    waitingOnInbound
      ? `Materials are dependent on inbound availability until ${formatDate(order.materialAvailabilityEta!)}.`
      : null,
    steps.length === 0 ? "No explicit production steps are attached to this order yet." : null,
  ].filter(Boolean) as string[];

  return (
    <div className="app-page space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.58fr)_minmax(18rem,1fr)]">
        <div className="rounded-sm bg-gradient-to-r from-[#004260] via-[#005b82] to-[#0073aa] p-6 text-white shadow-[0_20px_60px_-32px_rgba(0,66,96,0.75)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/70">
                Sales / Order Detail
              </p>
              <h1 className="text-3xl font-black leading-tight">#{order.orderNumber}</h1>
              <p className="text-sm text-white/80">
                {orderSummary.customerName} • Ordered {formatDate(order.orderDate)} • {order.itemCount} line items
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { label: "Currency", value: order.currency },
              { label: "Lead time", value: `${order.deliveryLeadDays} days` },
              { label: "Prod hours", value: `${orderSummary.totalHours} hrs` },
              {
                label: "Work centers",
                value: orderSummary.workCentersInUse.length
                  ? orderSummary.workCentersInUse.join(", ")
                  : "Not assigned",
              },
            ].map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-2 rounded-sm bg-white/10 px-3 py-1 text-xs font-semibold leading-none tracking-wide text-white/90 backdrop-blur-sm"
              >
                <span className="text-white/70">{chip.label}</span>
                <span className="text-white">{chip.value}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-sm border border-slate-200 bg-white p-5 shadow-[0_4px_24px_-6px_rgba(25,28,30,0.08)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Workflow</p>
              <p className="text-sm text-slate-600">Update status or jump back to the order list.</p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex items-center justify-center rounded-sm border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              to="/orders"
            >
              Back to orders
            </Link>
            {nextStatus ? (
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-sm bg-gradient-to-r from-[#004260] to-[#005b82] px-4 py-2 text-sm font-semibold text-white transition-all hover:from-[#003a55] hover:to-[#004f73] disabled:opacity-60"
                disabled={updateOrderMutation.isPending}
                onClick={() => updateOrderMutation.mutate(nextStatus)}
              >
                Move to {nextStatus.replaceAll("_", " ")}
              </button>
            ) : (
              <div className="inline-flex items-center justify-center rounded-sm bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500">
                Status completed
              </div>
            )}
            {order.status !== "cancelled" && order.status !== "delivered" ? (
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-sm border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-60"
                disabled={updateOrderMutation.isPending}
                onClick={() => updateOrderMutation.mutate("cancelled")}
              >
                Cancel order
              </button>
            ) : null}
          </div>

          <div className="rounded-sm border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            <div className="font-semibold text-slate-800">
              {nextStatus ? `Next step: ${nextStatus.replaceAll("_", " ")}` : "No further steps."}
            </div>
            <div className="mt-1">
              {etaBlockers.length ? etaBlockers[0] : "No blockers detected from stored data."}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 2xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SnapshotCard
            label="Grand total"
            value={formatNok(order.grandTotal)}
            supporting="Stored commercial value at the time of order capture."
            tone="brand"
          />
          <SnapshotCard
            label="Estimated profit"
            value={formatNok(order.profitTotal)}
            supporting="Current stored margin after discounts and cost layering."
          />
          <SnapshotCard
            label="Promised ETA"
            value={order.promisedEta ? formatDate(order.promisedEta) : "TBD"}
            supporting="Customer-facing promise stored on the order."
            tone={orderSummary.delayed ? "warning" : "default"}
          />
          <SnapshotCard
            label="Production cost"
            value={formatNok(orderSummary.productionCost)}
            supporting={`${orderSummary.totalHours} hrs across ${orderSummary.workCentersInUse.length || 0} work center(s).`}
          />
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-[0_4px_24px_-6px_rgba(25,28,30,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Operational pulse
              </div>
              <div className="text-lg font-semibold text-slate-800">Live health of this order</div>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="mt-5 space-y-4">
            <div>
              <div className="text-base font-semibold text-slate-800">{orderSummary.customerName}</div>
              <div className="mt-1 text-sm text-slate-600">
                Ordered {formatDate(order.orderDate)} • {order.itemCount} sellable line(s)
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-sm border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Delivery path
                </div>
                <div className="mt-2 text-base font-semibold text-slate-800">
                  {order.deliveryEta ? formatDate(order.deliveryEta) : "Pending"}
                </div>
              </div>
              <div className="rounded-sm border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Materials
                </div>
                <div className="mt-2 text-base font-semibold text-slate-800">
                  {waitingOnInbound ? "Inbound linked" : "Covered"}
                </div>
              </div>
            </div>
            {etaBlockers.length ? (
              <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                {etaBlockers[0]}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        <OrderStatusTimeline status={order.status} />

        <DataPanel
          title="Operational blockers"
          description="Most likely reasons this order could drift away from its current promise."
        >
          {etaBlockers.length ? (
            <ul className="space-y-3 text-sm text-slate-600">
              {etaBlockers.map((blocker) => (
                <li
                  key={blocker}
                  className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900"
                >
                  {blocker}
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-sm border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              No immediate blockers detected from the stored material, production, and promise data.
            </div>
          )}
        </DataPanel>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <DataPanel
          title="Order summary"
          description="Stored commercial and operational values for this order."
        >
          <div className="mb-5 flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
            {orderSummary.delayed ? (
              <span className="rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-rose-800">
                Delayed
              </span>
            ) : null}
          </div>

          <FieldGrid
            fields={[
              { label: "Customer", value: orderSummary.customerName },
              { label: "Currency", value: order.currency },
              { label: "Line count", value: orderSummary.totalLines },
              { label: "Total production hours", value: `${orderSummary.totalHours} hrs` },
              { label: "Delivery lead days", value: order.deliveryLeadDays },
              {
                label: "Work centers in use",
                value: orderSummary.workCentersInUse.length
                  ? orderSummary.workCentersInUse.join(", ")
                  : "None",
              },
            ]}
          />

          {order.notes ? (
            <div className="mt-5 rounded-sm border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              {order.notes}
            </div>
          ) : null}
        </DataPanel>

        <OrderEtaPanel
          eta={{
            materialAvailabilityEta: order.materialAvailabilityEta,
            productionCompletionEta: order.productionCompletionEta,
            deliveryEta: order.deliveryEta,
            promisedEta: order.promisedEta,
            waitingOnInbound,
            blocked: !order.materialAvailabilityEta,
            blockers: !order.materialAvailabilityEta
              ? ["One or more order lines cannot be fully covered by available or inbound supply."]
              : [],
          }}
          qualityCheckLeadDays={businessSettings.qualityCheckLeadDays}
          packagingLeadDays={businessSettings.packagingLeadDays}
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <DataPanel
          title="Order lines"
          description="Products and components sold on this order. Component lines expose the base-product breakdown used for fulfillment and costing."
        >
          <div className="space-y-4">
            {enrichedItems.map((item) => (
              <div
                key={item.id}
                className="rounded-sm border border-slate-200 bg-white p-4 shadow-[0_4px_24px_-10px_rgba(25,28,30,0.08)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-slate-800">
                        {item.itemName}
                      </div>
                      <StatusBadge value={item.itemType} />
                    </div>
                    <div className="text-xs text-slate-600">
                      {item.itemSku} • {item.quantity} {item.itemUnit}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-right md:grid-cols-4">
                    <MetricBlock label="Unit price" value={formatNok(item.unitPrice)} />
                    <MetricBlock label="Discount" value={formatNok(item.discountAmount)} />
                    <MetricBlock label="Line total" value={formatNok(item.lineTotal)} />
                    <MetricBlock label="Profit" value={formatNok(item.profitAmount)} />
                  </div>
                </div>

                {item.breakdown.length > 0 ? (
                  <div className="mt-4 rounded-sm border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">
                          Underlying product breakdown
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          Ready-made component stock is consumed first. Any shortage falls back to the component&apos;s constituent products and inbound availability.
                        </p>
                      </div>
                    </div>

                    <div className="app-table-shell rounded-sm overflow-hidden">
                      <table className="app-table">
                        <thead>
                          <tr>
                            <th>Base product</th>
                            <th>SKU</th>
                            <th>Qty / unit</th>
                            <th>Total qty</th>
                            <th>Available</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.breakdown.map((row) => (
                            <tr key={row.productId}>
                              <td>{row.productName}</td>
                              <td className="font-mono text-xs uppercase tracking-[0.12em] text-slate-600">
                                {row.productSku}
                              </td>
                              <td>{row.quantityPerUnit}</td>
                              <td>{row.totalQuantity}</td>
                              <td>{row.availableQuantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </DataPanel>

        <DataPanel
          title="Production steps"
          description="Order-level work centers, step timing, and actual production costs tracked separately from standard component production cost."
        >
          {steps.length === 0 ? (
            <div className="rounded-sm border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-600">
              No production steps are attached to this order.
            </div>
          ) : (
            <div className="app-table-shell rounded-sm overflow-hidden">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Step</th>
                    <th>Work center</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {steps.map((step) => (
                    <tr key={step.id}>
                      <td>
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-800">
                            {step.stepName}
                          </div>
                          {step.description ? (
                            <div className="text-xs text-slate-600">{step.description}</div>
                          ) : null}
                        </div>
                      </td>
                      <td>{workCenterLookup.get(step.workCenterId)?.name ?? "Unknown"}</td>
                      <td>{step.status ? <StatusBadge value={step.status} /> : "Not set"}</td>
                      <td>{step.timeHours} hrs</td>
                      <td>{formatNok(step.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DataPanel>
      </div>
    </div>
  );
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}
