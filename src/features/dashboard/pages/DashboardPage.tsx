import type { ReactNode, SVGProps } from "react";
import { Link } from "react-router-dom";

import {
  buildDashboardViewModel,
  type DashboardComponentRiskRow,
  type DashboardInboundRow,
  type DashboardInventoryRow,
  type DashboardOrderRow,
  type DashboardRankRow,
  type DashboardStatusRow,
} from "@/features/dashboard/models/dashboardSelectors";
import {
  useComponentProducts,
  useComponents,
  useCustomers,
  useOrderItems,
  useOrders,
  useProducts,
  useSupplierPurchaseOrderItems,
  useSupplierPurchaseOrders,
  useSuppliers,
} from "@/services/hooks/useDomainQueries";
import { formatDate, formatNok } from "@/shared/lib/format";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import {
  ComponentIcon,
  CustomersIcon,
  DashboardIcon,
  InboundIcon,
  InventoryIcon,
  OrdersIcon,
} from "@/shared/ui/icons";

const displayDate = (value: string | null) => (value ? formatDate(value) : "TBD");
const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

type IconComponent = (props: SVGProps<SVGSVGElement>) => ReactNode;

const timeRanges = ["Today", "Week", "Month"] as const;

export function DashboardPage() {
  const ordersQuery = useOrders();
  const orderItemsQuery = useOrderItems();
  const productsQuery = useProducts();
  const componentsQuery = useComponents();
  const componentProductsQuery = useComponentProducts();
  const customersQuery = useCustomers();
  const supplierPurchaseOrdersQuery = useSupplierPurchaseOrders();
  const supplierPurchaseOrderItemsQuery = useSupplierPurchaseOrderItems();
  const suppliersQuery = useSuppliers();

  const isLoading =
    ordersQuery.isLoading ||
    orderItemsQuery.isLoading ||
    productsQuery.isLoading ||
    componentsQuery.isLoading ||
    componentProductsQuery.isLoading ||
    customersQuery.isLoading ||
    supplierPurchaseOrdersQuery.isLoading ||
    supplierPurchaseOrderItemsQuery.isLoading ||
    suppliersQuery.isLoading;

  if (isLoading) {
    return <LoadingState label="Loading the Lovold operations dashboard..." />;
  }

  const isError =
    ordersQuery.isError ||
    orderItemsQuery.isError ||
    productsQuery.isError ||
    componentsQuery.isError ||
    componentProductsQuery.isError ||
    customersQuery.isError ||
    supplierPurchaseOrdersQuery.isError ||
    supplierPurchaseOrderItemsQuery.isError ||
    suppliersQuery.isError;

  if (isError) {
    return (
      <ErrorState
        title="Could not assemble the operations dashboard."
        message="One or more domain datasets failed to load. Refresh the page to try again."
      />
    );
  }

  const orders = ordersQuery.data ?? [];
  const orderItems = orderItemsQuery.data ?? [];
  const viewModel = buildDashboardViewModel({
    orders,
    orderItems,
    products: productsQuery.data ?? [],
    components: componentsQuery.data ?? [],
    componentProducts: componentProductsQuery.data ?? [],
    customers: customersQuery.data ?? [],
    supplierPurchaseOrders: supplierPurchaseOrdersQuery.data ?? [],
    supplierPurchaseOrderItems: supplierPurchaseOrderItemsQuery.data ?? [],
    suppliers: suppliersQuery.data ?? [],
  });

  const orderItemsByOrder = orderItems.reduce<
    Map<
      string,
      Array<{
        itemName: string;
        itemType: string;
      }>
    >
  >((map, item) => {
    const current = map.get(item.orderId) ?? [];
    current.push({ itemName: item.itemName, itemType: item.itemType });
    map.set(item.orderId, current);
    return map;
  }, new Map());

  const recentOrders = viewModel.recentOrders.map((order) => ({
    ...order,
    configurationSummary: buildConfigurationSummary(orderItemsByOrder.get(order.id) ?? []),
  }));

  const stockPressureRows = [
    ...viewModel.lowAvailableStock.slice(0, 3).map((item) => ({
      ...item,
      attentionLabel: "Low availability",
      attentionTone: "critical" as const,
    })),
    ...viewModel.highReservedStock
      .filter(
        (candidate) =>
          !viewModel.lowAvailableStock.some(
            (existing) => existing.id === candidate.id && existing.type === candidate.type,
          ),
      )
      .slice(0, 2)
      .map((item) => ({
        ...item,
        attentionLabel: "Reserved pressure",
        attentionTone: "watch" as const,
      })),
  ];

  const totalOrders = viewModel.orderStatusDistribution.reduce(
    (sum, entry) => sum + entry.count,
    0,
  );
  const activeOrders = orders.filter(
    (order) => order.status !== "delivered" && order.status !== "cancelled",
  );
  const activeOrderCount = activeOrders.length;
  const onTimeRate =
    activeOrderCount > 0
      ? Math.max(
          0,
          Math.round(
            ((activeOrderCount - viewModel.kpis.delayedOrders) / activeOrderCount) * 100,
          ),
        )
      : 100;

  const materialSignal =
    viewModel.kpis.ordersAwaitingMaterials > 0 ? "Watching inbound" : "Materials stable";
  const materialSignalTone =
    viewModel.kpis.ordersAwaitingMaterials > 0 ? "warning" : "positive";
  const productionSignal =
    viewModel.kpis.ordersInProduction > 0
      ? `${viewModel.kpis.ordersInProduction} order${viewModel.kpis.ordersInProduction === 1 ? "" : "s"} live`
      : "No live manufacturing";
  const deliverySignal =
    viewModel.kpis.delayedOrders > 0
      ? `${viewModel.kpis.delayedOrders} promise${viewModel.kpis.delayedOrders === 1 ? "" : "s"} behind`
      : "Promise window healthy";

  return (
    <div className="app-page space-y-5">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-900">
            <DashboardIcon className="h-4 w-4" />
            Executive dashboard
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-[2.2rem]">
              Lovold executive operations dashboard
            </h1>
            <p className="max-w-4xl text-sm leading-6 text-slate-600">
              Commercial, supply, and delivery visibility across the Lovold aquaculture
              pipeline. Use this view to monitor delayed customer commitments, inbound
              dependencies, reservation-aware inventory pressure, and the strongest revenue
              drivers across products and components.
            </p>
          </div>
        </div>

        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {timeRanges.map((label, index) => (
            <button
              key={label}
              type="button"
              className={cn(
                "rounded-md px-4 py-2 text-sm font-semibold transition",
                index === 2
                  ? "bg-[var(--brand-900)] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(11rem,1fr))]">
        <KpiTile
          label="Total sales"
          value={formatNok(viewModel.kpis.totalSales)}
          supporting="Booked across the full mock ledger"
          icon={DashboardIcon}
        />
        <KpiTile
          label="Total orders"
          value={String(viewModel.kpis.totalOrders)}
          supporting="Across every lifecycle state"
          icon={OrdersIcon}
        />
        <KpiTile
          label="Estimated profit"
          value={formatNok(viewModel.kpis.estimatedProfit)}
          supporting="Current stored commercial margin"
          tone="brand"
          icon={DashboardIcon}
        />
        <KpiTile
          label="Delayed orders"
          value={String(viewModel.kpis.delayedOrders)}
          supporting="Past promised ETA"
          tone="warning"
          icon={OrdersIcon}
        />
        <KpiTile
          label="In production"
          value={String(viewModel.kpis.ordersInProduction)}
          supporting="Live manufacturing workload"
          icon={ComponentIcon}
        />
        <KpiTile
          label="Awaiting materials"
          value={String(viewModel.kpis.ordersAwaitingMaterials)}
          supporting="Waiting on inbound supply"
          tone={viewModel.kpis.ordersAwaitingMaterials > 0 ? "warning" : "default"}
          icon={InboundIcon}
        />
        <KpiTile
          label="Active customers"
          value={String(viewModel.kpis.activeCustomers)}
          supporting="Accounts currently in play"
          icon={CustomersIcon}
        />
        <KpiTile
          label="Inbound due soon"
          value={String(viewModel.kpis.inboundDueSoon)}
          supporting="Open supplier POs within 14 days"
          icon={InboundIcon}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr,0.75fr]">
        <DashboardPanel
          icon={OrdersIcon}
          title="Delayed & risk orders"
          description="Customer commitments already behind schedule or close to their promise window."
          action={
            <Link className="app-button-ghost !rounded-md !px-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-800)] hover:bg-transparent hover:text-[var(--brand-900)]" to="/orders">
              View logistics map
            </Link>
          }
        >
          <div className="space-y-4">
            <RiskGroup
              title="Delayed"
              tone="danger"
              rows={viewModel.delayedOrders}
              emptyCopy="No delayed orders are currently active."
            />
            <RiskGroup
              title="ETA risk"
              tone="watch"
              rows={viewModel.etaRiskOrders}
              emptyCopy="No near-term ETA risk is visible."
            />
          </div>
        </DashboardPanel>

        <DashboardPanel
          icon={InventoryIcon}
          title="Critical stock levels"
          description="Low availability and reservation-heavy items that can impact Lovold delivery commitments."
          action={
            <Link className="app-button-ghost !rounded-md !px-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-800)] hover:bg-transparent hover:text-[var(--brand-900)]" to="/inventory/products">
              Open stock registry
            </Link>
          }
        >
          <StockPressurePanel
            rows={stockPressureRows}
            componentRisks={viewModel.componentShortageRisks}
          />
        </DashboardPanel>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr,0.6fr]">
        <DashboardPanel
          icon={OrdersIcon}
          title="Recent sales orders"
          description="Newest commercial activity across products and components."
          action={
            <Link className="app-button-ghost !rounded-md !px-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-800)] hover:bg-transparent hover:text-[var(--brand-900)]" to="/orders">
              Order register
            </Link>
          }
        >
          <RecentOrdersTable rows={recentOrders} />
        </DashboardPanel>

        <DashboardPanel
          icon={InboundIcon}
          title="Upcoming inbound POs"
          description="Supplier purchase orders currently driving short-term material availability."
        >
          <InboundTimeline rows={viewModel.upcomingInbound} />
        </DashboardPanel>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.82fr,0.88fr,1.3fr]">
        <DashboardPanel
          icon={DashboardIcon}
          title="Orders by status"
          description="Current mix across the finalized Lovold order lifecycle."
        >
          <StatusDistributionPanel rows={viewModel.orderStatusDistribution} total={totalOrders} />
        </DashboardPanel>

        <DashboardPanel
          icon={CustomersIcon}
          title="Top customers"
          description="Highest booked revenue across the current dataset."
        >
          <RankedStack rows={viewModel.topCustomers} valueLabel="Sales" />
        </DashboardPanel>

        <DashboardPanel
          icon={ComponentIcon}
          title="Top sellable items"
          description="Revenue leaders across both products and components."
        >
          <TopSellablePanel rows={viewModel.topSellableItems} />
        </DashboardPanel>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr,0.6fr]">
        <SupplyChainPulsePanel
          materialSignal={materialSignal}
          materialSignalTone={materialSignalTone}
          productionSignal={productionSignal}
          deliverySignal={deliverySignal}
          delayedOrders={viewModel.kpis.delayedOrders}
          inboundDueSoon={viewModel.kpis.inboundDueSoon}
          awaitingMaterials={viewModel.kpis.ordersAwaitingMaterials}
        />

        <OperationalEfficiencyCard
          onTimeRate={onTimeRate}
          delayedOrders={viewModel.kpis.delayedOrders}
          activeOrders={activeOrderCount}
          inboundDueSoon={viewModel.kpis.inboundDueSoon}
        />
      </section>
    </div>
  );
}

function KpiTile({
  label,
  value,
  supporting,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  supporting: string;
  icon: IconComponent;
  tone?: "default" | "brand" | "warning";
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-lg border px-4 py-4 shadow-sm",
        tone === "brand"
          ? "border-[var(--brand-800)] bg-[var(--brand-900)] text-white"
          : tone === "warning"
            ? "border-amber-300 bg-amber-50"
            : "border-slate-200 bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-3">
          <div
            className={cn(
              "text-[10px] font-extrabold uppercase tracking-[0.18em]",
              tone === "brand" ? "text-white/70" : "text-slate-500",
              tone === "warning" && "text-amber-700",
            )}
          >
            {label}
          </div>
          <div
            className={cn(
              "break-words text-[clamp(1.55rem,1.7vw,1.85rem)] font-extrabold leading-none tracking-tight",
              tone === "warning" && "text-amber-900",
            )}
          >
            {value}
          </div>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border",
            tone === "brand"
              ? "border-white/15 bg-white/10 text-white"
              : tone === "warning"
                ? "border-amber-200 bg-amber-100 text-amber-800"
                : "border-slate-200 bg-slate-50 text-[var(--brand-800)]",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div
        className={cn(
          "mt-3 text-xs leading-5",
          tone === "brand" ? "text-white/75" : "text-slate-500",
          tone === "warning" && "text-amber-800",
        )}
      >
        {supporting}
      </div>
    </div>
  );
}

function DashboardPanel({
  title,
  description,
  action,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon: IconComponent;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/70 bg-slate-50 px-5 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500">
            <Icon className="h-4 w-4 text-[var(--brand-700)]" />
            {title}
          </div>
          <p className="text-sm leading-6 text-slate-600">{description}</p>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function RiskGroup({
  title,
  tone,
  rows,
  emptyCopy,
}: {
  title: string;
  tone: "danger" | "watch";
  rows: DashboardOrderRow[];
  emptyCopy: string;
}) {
  return (
    <div className="space-y-3">
      <div
        className={cn(
          "inline-flex rounded-md px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em]",
          tone === "danger"
            ? "bg-rose-100 text-rose-800"
            : "bg-amber-100 text-amber-800",
        )}
      >
        {title}
      </div>
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
          {emptyCopy}
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((order) => (
            <Link
              key={`${title}-${order.id}`}
              className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-[var(--brand-700)] hover:bg-white"
              to={`/orders/${order.id}`}
            >
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900">{order.orderNumber}</div>
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  {order.customerName}
                </div>
                <div className="text-xs text-slate-500">
                  Materials {displayDate(order.materialAvailabilityEta)}
                </div>
              </div>
              <div className="space-y-2 text-right">
                <StatusBadge value={order.status} />
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Promise {displayDate(order.promisedEta)}
                </div>
                {order.daysFromPromise !== null ? (
                  <div
                    className={cn(
                      "text-xs font-semibold",
                      order.daysFromPromise < 0 ? "text-rose-700" : "text-amber-700",
                    )}
                  >
                    {order.daysFromPromise < 0
                      ? `${Math.abs(order.daysFromPromise)} day${Math.abs(order.daysFromPromise) === 1 ? "" : "s"} late`
                      : `${order.daysFromPromise} day${order.daysFromPromise === 1 ? "" : "s"} remaining`}
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StockPressurePanel({
  rows,
  componentRisks,
}: {
  rows: Array<
    DashboardInventoryRow & {
      attentionLabel: string;
      attentionTone: "critical" | "watch";
    }
  >;
  componentRisks: DashboardComponentRiskRow[];
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
            No product or component is currently under stock pressure.
          </p>
        ) : (
          rows.map((item) => (
            <Link
              key={`${item.type}:${item.id}`}
              className="flex items-center justify-between gap-4 border-b border-slate-200/80 py-3 last:border-b-0"
              to={
                item.type === "component"
                  ? `/inventory/components/${item.id}`
                  : `/inventory/products/${item.id}`
              }
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                    {item.sku}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em]",
                      item.attentionTone === "critical"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800",
                    )}
                  >
                    {item.attentionLabel}
                  </span>
                </div>
                <div className="truncate text-sm font-semibold text-slate-900">{item.name}</div>
                <div className="text-xs text-slate-500">{item.supporting}</div>
              </div>

              <div className="grid min-w-[120px] grid-cols-2 gap-6 text-right">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Available
                  </div>
                  <div
                    className={cn(
                      "mt-1 text-sm font-extrabold",
                      item.availableQuantity <= 0 ? "text-rose-700" : "text-slate-900",
                    )}
                  >
                    {item.availableQuantity}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Reserved
                  </div>
                  <div className="mt-1 text-sm font-extrabold text-slate-900">
                    {item.reservedQuantity}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-800">
          Component shortage risk
        </div>
        {componentRisks.length === 0 ? (
          <p className="mt-2 text-sm text-amber-900">
            No ready-made component is currently blocked by missing base products.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {componentRisks.map((component) => (
              <span
                key={component.componentId}
                className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-900"
              >
                {component.name}: {component.blockedProducts[0]?.productName ?? "Material short"}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecentOrdersTable({
  rows,
}: {
  rows: Array<DashboardOrderRow & { configurationSummary: string }>;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-100">
            <tr>
              {["Order ID", "Customer", "Configuration", "Value", "Status"].map((label) => (
                <th
                  key={label}
                  className="px-5 py-3 text-left text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((order) => (
              <tr key={order.id} className="bg-white transition hover:bg-slate-50">
                <td className="px-5 py-4">
                  <Link
                    className="text-xs font-extrabold tracking-[0.08em] text-slate-900"
                    to={`/orders/${order.id}`}
                  >
                    {order.orderNumber}
                  </Link>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {formatDate(order.orderDate)}
                  </div>
                </td>
                <td className="px-5 py-4 text-sm font-medium text-slate-700">
                  {order.customerName}
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">
                  {order.configurationSummary}
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                  {formatNok(order.grandTotal)}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge value={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InboundTimeline({ rows }: { rows: DashboardInboundRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
        No inbound supplier activity is active right now.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {rows.map((purchaseOrder, index) => (
          <Link
            key={purchaseOrder.id}
            className={cn(
              "flex items-start gap-4 rounded-lg px-1 py-1 transition hover:bg-slate-50",
              index >= 3 && "opacity-80",
            )}
            to={`/inbound/${purchaseOrder.id}`}
          >
            <span
              className={cn(
                "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                purchaseOrder.status === "ordered"
                  ? "bg-[var(--brand-700)]"
                  : "bg-amber-500",
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-slate-900">{purchaseOrder.supplierName}</p>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  {displayDate(purchaseOrder.eta)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {purchaseOrder.poNumber}: {purchaseOrder.lineCount} lines,{" "}
                {purchaseOrder.remainingUnits} units remaining
              </p>
            </div>
          </Link>
        ))}
      </div>
      <Link
        className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-50"
        to="/inbound"
      >
        Warehouse receiving dock
      </Link>
    </div>
  );
}

function StatusDistributionPanel({
  rows,
  total,
}: {
  rows: DashboardStatusRow[];
  total: number;
}) {
  return (
    <div className="space-y-4">
      {rows.map((entry, index) => {
        const percentage = total > 0 ? Math.round((entry.count / total) * 100) : 0;
        const color = statusBarColors[index % statusBarColors.length];

        return (
          <div key={entry.status} className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="w-24 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                {entry.status.replaceAll("_", " ")}
              </span>
              <div className="flex flex-1 items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-bold text-slate-900">
                  {percentage}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RankedStack({
  rows,
  valueLabel,
}: {
  rows: DashboardRankRow[];
  valueLabel: string;
}) {
  return (
    <div className="divide-y divide-slate-200">
      {rows.map((row) => (
        <div key={row.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">{row.name}</div>
            <div className="truncate text-xs text-slate-500">{row.supporting}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
              {valueLabel}
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              {formatNok(row.value)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TopSellablePanel({ rows }: { rows: DashboardRankRow[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {rows.map((row, index) => {
        const supporting = row.supporting.toLowerCase().includes("component")
          ? "Component"
          : "Product";

        return (
          <div
            key={row.id}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-[var(--brand-700)] hover:bg-white"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--brand-100)] text-sm font-extrabold text-[var(--brand-900)]">
                  {index + 1}
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-900">{row.name}</div>
                  <div className="inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-600">
                    {supporting}
                  </div>
                  <div className="text-xs text-slate-500">{row.supporting}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
                  Revenue
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {formatNok(row.value)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SupplyChainPulsePanel({
  materialSignal,
  materialSignalTone,
  productionSignal,
  deliverySignal,
  delayedOrders,
  inboundDueSoon,
  awaitingMaterials,
}: {
  materialSignal: string;
  materialSignalTone: "warning" | "positive";
  productionSignal: string;
  deliverySignal: string;
  delayedOrders: number;
  inboundDueSoon: number;
  awaitingMaterials: number;
}) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-slate-900 bg-slate-950 p-6 text-white shadow-[0_18px_48px_rgba(2,12,27,0.32)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.28),_transparent_42%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(148,163,184,0.08)_0%,_transparent_35%,_transparent_100%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(148,163,184,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.22)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative z-10 flex h-full flex-col justify-between gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-sky-300">
            <InboundIcon className="h-4 w-4" />
            Global supply chain status
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Live facility performance index
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">
              A consolidated view of materials, production, and delivery readiness across the
              Lovold ERP operating model. This block highlights where the current order pipeline is
              most likely to slip against promised ETA.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <SignalCard
            label="Material flow"
            value={materialSignal}
            supporting={`${awaitingMaterials} order${awaitingMaterials === 1 ? "" : "s"} currently waiting on supply`}
            tone={materialSignalTone}
          />
          <SignalCard
            label="Production lane"
            value={productionSignal}
            supporting="Based on active work in the finalized order lifecycle"
            tone="info"
          />
          <SignalCard
            label="Delivery exposure"
            value={deliverySignal}
            supporting={`${delayedOrders} delayed • ${inboundDueSoon} inbound due soon`}
            tone={delayedOrders > 0 ? "warning" : "positive"}
          />
        </div>
      </div>
    </section>
  );
}

function OperationalEfficiencyCard({
  onTimeRate,
  delayedOrders,
  activeOrders,
  inboundDueSoon,
}: {
  onTimeRate: number;
  delayedOrders: number;
  activeOrders: number;
  inboundDueSoon: number;
}) {
  const gradientStop = `${Math.min(Math.max(onTimeRate, 0), 100)}%`;

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="space-y-5">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500">
            Operational efficiency
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            A quick read on promise adherence across open orders using delayed commitments as the
            primary signal.
          </p>
        </div>

        <div className="grid place-items-center">
          <div
            className="relative h-36 w-36 rounded-full"
            style={{
              background: `conic-gradient(var(--brand-700) ${gradientStop}, #dbe5ec ${gradientStop})`,
            }}
          >
            <div className="absolute inset-3 rounded-full bg-slate-50" />
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <div className="text-3xl font-extrabold tracking-tight text-slate-950">
                  {onTimeRate}%
                </div>
                <div className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500">
                  On-time promise
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <EfficiencyMetric label="Open orders" value={String(activeOrders)} />
          <EfficiencyMetric
            label="Delayed orders"
            value={String(delayedOrders)}
            tone={delayedOrders > 0 ? "warning" : "default"}
          />
          <EfficiencyMetric label="Inbound due soon" value={String(inboundDueSoon)} />
        </div>
      </div>
    </section>
  );
}

function SignalCard({
  label,
  value,
  supporting,
  tone,
}: {
  label: string;
  value: string;
  supporting: string;
  tone: "warning" | "positive" | "info";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-4",
        tone === "warning" && "border-amber-300/60 bg-amber-500/10",
        tone === "positive" && "border-emerald-300/30 bg-emerald-500/10",
        tone === "info" && "border-slate-700 bg-white/5",
      )}
    >
      <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-300">
        {label}
      </div>
      <div className="mt-3 text-lg font-extrabold tracking-tight text-white">{value}</div>
      <div className="mt-2 text-xs leading-5 text-slate-300">{supporting}</div>
    </div>
  );
}

function EfficiencyMetric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warning";
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-extrabold",
          tone === "warning" ? "text-amber-800" : "text-slate-900",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function buildConfigurationSummary(
  items: Array<{
    itemName: string;
    itemType: string;
  }>,
) {
  if (items.length === 0) return "No configuration captured";
  const first = items[0];

  if (items.length === 1) {
    return `${first.itemName} (${first.itemType})`;
  }

  return `${first.itemName} + ${items.length - 1} more line${items.length - 1 === 1 ? "" : "s"}`;
}

const statusBarColors = [
  "#94a3b8",
  "#3b82f6",
  "#6366f1",
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#10b981",
  "#ef4444",
];
