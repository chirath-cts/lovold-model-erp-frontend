import { useMemo } from "react";

import {
  useCustomers,
  useOrderItems,
  useOrders,
  useProducts,
} from "@/services/hooks/useDomainQueries";
import { formatDate } from "@/shared/lib/format";
import { CurrencyText } from "@/shared/ui/CurrencyText";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import {
  getDashboardMetrics,
  getTopCustomers,
  getTopProducts,
} from "@/features/dashboard/models/dashboardSelectors";

const palette = {
  background: "#f4faff",
  surface: "#ffffff",
  surfaceLow: "#e8f6fe",
  surfaceHighest: "#d7e5ed",
  primary: "#003a4d",
  primaryContainer: "#00526c",
  primaryFixed: "#bfe8ff",
  secondaryFixed: "#bfe8ff",
  tertiaryFixed: "#c7e7f9",
  secondary: "#1f6581",
  tertiary: "#183947",
  outline: "#c0c8cd",
  muted: "#70787d",
  error: "#ba1a1a",
};

const getInitials = (text: string) =>
  text
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const statusColor = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === "delivered") return palette.primary;
  if (normalized === "dispatched") return palette.secondary;
  if (normalized === "confirmed") return "#9eddfd";
  return "rgba(64, 72, 76, 0.45)";
};

const avatarSwatches = [
  { bg: palette.primaryFixed, color: palette.primary },
  { bg: palette.secondaryFixed, color: palette.secondary },
  { bg: palette.tertiaryFixed, color: palette.tertiary },
];

const getAvatarStyle = (index: number) =>
  avatarSwatches[index % avatarSwatches.length];

function BagIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 7h12l-1 12H7L6 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  );
}

function GroupIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="9" cy="7" r="3" />
      <circle cx="17" cy="7" r="3" />
      <path d="M2 21a6 6 0 0 1 12 0" />
      <path d="M12 21a6 6 0 0 1 12 0" />
    </svg>
  );
}

function TrendingIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function VerifiedIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 12.75 11.25 15 15 9.75" />
      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="m10.29 3.86-8.18 14A1.64 1.64 0 0 0 3.47 21h17.06a1.64 1.64 0 0 0 1.36-3.14l-8.18-14a1.64 1.64 0 0 0-2.82 0Z" />
    </svg>
  );
}

function buildTrendPaths(values: number[], width = 720, height = 220) {
  if (!values.length) {
    return { linePath: "", areaPath: "", markers: [] as { x: number; y: number }[] };
  }
  const padding = 16;
  const max = Math.max(...values, 1);
  const innerHeight = height - padding * 2;
  const count = Math.max(values.length, 2);
  const step = (width - padding * 2) / (count - 1);

  const coords = values.map((value, index) => {
    const x = padding + index * step;
    const y = height - padding - (value / max) * innerHeight * 0.9;
    return { x, y };
  });

  if (coords.length === 1) {
    coords.push({ x: padding + step, y: coords[0].y });
  }

  const linePath = coords
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");

  const areaPath = [
    `M${padding},${height - padding}`,
    linePath.replace(/^M/, "L"),
    `L${padding + (coords.length - 1) * step},${height - padding}`,
    "Z",
  ].join(" ");

  return { linePath, areaPath, markers: coords };
}

export function DashboardPage() {
  const ordersQuery = useOrders();
  const productsQuery = useProducts();
  const customersQuery = useCustomers();
  const orderItemsQuery = useOrderItems();

  const orders = ordersQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const customers = customersQuery.data ?? [];
  const orderItems = orderItemsQuery.data ?? [];

  const isLoading =
    ordersQuery.isLoading ||
    productsQuery.isLoading ||
    customersQuery.isLoading ||
    orderItemsQuery.isLoading;

  const hasError =
    Boolean(ordersQuery.error) ||
    Boolean(productsQuery.error) ||
    Boolean(customersQuery.error) ||
    Boolean(orderItemsQuery.error);

  const metrics = getDashboardMetrics(orders, products, customers);

  const salesTrend = orders
    .slice()
    .sort(
      (a, b) =>
        new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime(),
    )
    .map((order) => ({
      name: formatDate(order.orderDate),
      sales: order.grandTotal,
    }))
    .slice(-7);
  const salesValues = salesTrend.length
    ? salesTrend.map((point) => point.sales)
    : [0];
  const trendPaths = buildTrendPaths(salesValues);

  const statusMap = new Map<string, number>();
  orders.forEach((order) =>
    statusMap.set(order.status, (statusMap.get(order.status) ?? 0) + 1),
  );
  const orderStatusData = [...statusMap.entries()].map(([status, count]) => ({
    status,
    count,
  }));

  const totalOrderCount = orders.length || 1;
  const orderStatusDistribution = orderStatusData.map(({ status, count }) => ({
    status,
    count,
    percent: Math.round((count / totalOrderCount) * 100),
    color: statusColor(status),
  }));

  const fulfilledStatuses = new Set(["delivered", "dispatched"]);
  const fulfillmentRate = orders.length
    ? Math.round(
        (orders.filter((order) => fulfilledStatuses.has(order.status)).length /
          orders.length) *
          1000,
      ) / 10
    : 0;

  const topCustomers = getTopCustomers(orders, customers);
  const topProducts = getTopProducts(orderItems, products);
  const customerLookup = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer.name])),
    [customers],
  );
  const customerOrderCounts = useMemo(() => {
    const counts = new Map<string, number>();
    orders.forEach((order) =>
      counts.set(order.customerId, (counts.get(order.customerId) ?? 0) + 1),
    );
    return counts;
  }, [orders]);

  const lowStockProducts = products
    .filter((product) => product.stockQuantity <= product.reorderLevel)
    .sort((a, b) => a.stockQuantity - b.stockQuantity)
    .slice(0, 4);

  const recentOrders = orders
    .slice()
    .sort(
      (a, b) =>
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
    )
    .slice(0, 6);

  if (isLoading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (hasError) {
    return <ErrorState message="Failed to load dashboard data." />;
  }

  return (
    <div className="min-h-screen bg-[#f4faff] p-4 text-[#111d23] sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#003a4d]">
            Enterprise Overview
          </h1>
          <p className="text-sm text-[#40484c]">
            Real-time performance metrics for aquaculture logistics.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-[#e8f6fe] p-1">
          <button className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#003a4d] shadow-sm">
            Today
          </button>
          <button className="px-4 py-2 text-sm font-semibold text-[#40484c] transition-colors hover:text-[#003a4d]">
            Week
          </button>
          <button className="px-4 py-2 text-sm font-semibold text-[#40484c] transition-colors hover:text-[#003a4d]">
            Month
          </button>
          <span className="mx-1 h-4 w-px bg-[#c0c8cd]/50" />
          <button className="flex h-10 w-10 items-center justify-center text-[#40484c]">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5 mt-4">
        <div className="flex h-full flex-col justify-between rounded-xl bg-white p-6 shadow-[0_4px_20px_rgba(0,58,77,0.03)]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#70787d]">
              Total Sales
            </span>
            <span className="rounded bg-[#bfe8ff] px-2 py-0.5 text-[10px] font-bold text-[#00526c]">
              +12%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-extrabold text-[#111d23]">
              <CurrencyText value={metrics.totalSales} />
            </p>
            <p className="mt-1 text-xs text-[#70787d]">vs. last period</p>
          </div>
        </div>
        <div className="flex h-full flex-col justify-between rounded-xl bg-white p-6 shadow-[0_4px_20px_rgba(0,58,77,0.03)]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#70787d]">
              Total Orders
            </span>
            <BagIcon className="h-5 w-5 text-[#1f6581]" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-extrabold text-[#111d23]">
              {metrics.totalOrders}
            </p>
            <p className="mt-1 text-xs text-[#70787d]">Confirmed orders</p>
          </div>
        </div>
        <div className="flex h-full flex-col justify-between rounded-xl bg-white p-6 shadow-[0_4px_20px_rgba(0,58,77,0.03)]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#70787d]">
              Est. Profit
            </span>
            <span className="rounded bg-[#9eddfd] px-2 py-0.5 text-[10px] font-bold text-[#003a4d]">
              Safe
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-extrabold text-[#111d23]">
              <CurrencyText value={metrics.profitTotal} />
            </p>
            <p className="mt-1 text-xs text-[#70787d]">Margin: 25.7%</p>
          </div>
        </div>
        <div className="flex h-full flex-col justify-between rounded-xl bg-white p-6 shadow-[0_4px_20px_rgba(0,58,77,0.03)]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#70787d]">
              Low Stock
            </span>
            <span className="rounded bg-[#ffdad6] px-2 py-0.5 text-[10px] font-bold text-[#ba1a1a]">
              Action
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-extrabold text-[#ba1a1a]">
              {metrics.lowStockCount}
            </p>
            <p className="mt-1 text-xs text-[#70787d]">SKUs near threshold</p>
          </div>
        </div>
        <div className="flex h-full flex-col justify-between rounded-xl bg-white p-6 shadow-[0_4px_20px_rgba(0,58,77,0.03)]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#70787d]">
              Active Customers
            </span>
            <GroupIcon className="h-5 w-5 text-[#003a4d]" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-extrabold text-[#111d23]">
              {metrics.activeCustomers}
            </p>
            <p className="mt-1 text-xs text-[#70787d]">Active this month</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-4">
        <div className="rounded-xl bg-white p-6 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-[#003a4d]">Sales Trend</h4>
              <p className="text-xs text-[#70787d]">
                Revenue performance over time
              </p>
            </div>
            <button className="flex items-center gap-1 text-sm font-semibold text-[#003a4d]">
              View Report
              <TrendingIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="relative h-64 w-full">
            <svg className="h-full w-full" viewBox="0 0 720 220">
              <defs>
                <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#003a4d" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#003a4d" stopOpacity="0" />
                </linearGradient>
              </defs>
              {trendPaths.areaPath ? (
                <>
                  <path d={trendPaths.areaPath} fill="url(#trendGradient)" />
                  <path
                    d={trendPaths.linePath}
                    fill="none"
                    stroke="#003a4d"
                    strokeWidth="3"
                  />
                  {trendPaths.markers.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r={4}
                      fill="#003a4d"
                    />
                  ))}
                </>
              ) : null}
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 text-[10px] font-bold text-[#70787d]">
              {salesTrend.length ? (
                salesTrend.map((item) => <span key={item.name}>{item.name}</span>)
              ) : (
                <span>No data</span>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6">
          <h4 className="text-lg font-bold text-[#003a4d]">Order Distribution</h4>
          <p className="mb-6 text-xs text-[#70787d]">Current status breakdown</p>
          <div className="space-y-4">
            {orderStatusDistribution.map((item) => (
              <div key={item.status}>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#111d23]">
                    {item.status}
                  </span>
                  <span className="text-[#70787d]">{item.count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#e8f6fe]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 border-t border-[#c0c8cd]/40 pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9eddfd]/40 text-[#1f6581]">
                <VerifiedIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#70787d]">Fulfillment Rate</p>
                <p className="text-lg font-bold text-[#003a4d]">
                  {fulfillmentRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 mt-4">
        <div className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-xl font-bold text-[#003a4d]">Recent Orders</h4>
            <button className="text-sm font-semibold text-[#003a4d] underline underline-offset-4">
              See All Orders
            </button>
          </div>
          <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_20px_rgba(0,58,77,0.03)]">
            <table className="w-full border-collapse text-left">
              <thead className="bg-[#e8f6fe] text-[10px] font-bold uppercase tracking-[0.18em] text-[#70787d]">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c0c8cd]/20">
                {recentOrders.map((order, index) => {
                  const avatarStyle = getAvatarStyle(index);
                  return (
                    <tr
                      key={order.id}
                      className="cursor-pointer transition-colors hover:bg-[#d7e5ed]"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-[#003a4d]">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold"
                            style={{
                              backgroundColor: avatarStyle.bg,
                              color: avatarStyle.color,
                            }}
                          >
                            {getInitials(customerLookup.get(order.customerId) ?? "NA")}
                          </div>
                          <span className="text-sm font-medium">
                            {customerLookup.get(order.customerId) ?? "Unknown customer"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#70787d]">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">
                        <CurrencyText value={order.grandTotal} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge value={order.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-[#e8f6fe] p-6">
            <h4 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#003a4d]">
              <WarningIcon className="h-5 w-5 text-[#ba1a1a]" />
              Low Stock Products
            </h4>
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg bg-white p-3"
                >
                  <div>
                    <p className="text-sm font-bold text-[#111d23]">
                      {product.name}
                    </p>
                    <p className="text-[10px] text-[#70787d]">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#ba1a1a]">
                      {product.stockQuantity} Left
                    </p>
                    <button className="text-[10px] font-bold uppercase tracking-wide text-[#003a4d]">
                      Restock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#c0c8cd]/20 bg-white p-6 shadow-sm">
            <h4 className="mb-4 text-lg font-bold text-[#003a4d]">Top Customers</h4>
            <div className="space-y-4">
              {topCustomers.slice(0, 3).map((item) => (
                <div key={item.customerId} className="flex items-center gap-4">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-[#d7e5ed]">
                    <img
                      src={`https://lh3.googleusercontent.com/aida-public/AB6AXuAJr-81-ct22niioNCe6txV6VDlzBYT0B5-4L_1P6H88kI6ROpyY9tzPmbMMV_2Vwl2bfmOq5Dfejp1-7JAtDgy2eysTanY2SzXrgWlY6EK6gdbsAWB1fuz7BRnRH-xtoDVvXjNZho14nxqGMYSoTAV88hPLBwCczpfd0hQMJuOoUcFFdZozZB52qRmswkqktvAt3VgKEvuPb4hpSYQ-8TuNhrK7fAbH7CDo65X2p2OYY6W22vo0gWBOZADGl4ltFZIOjg4i9gFMQM`}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#111d23]">{item.name}</p>
                    <p className="text-[10px] text-[#70787d]">
                      {(customerOrderCounts.get(item.customerId) ?? 0).toLocaleString()} orders this month
                    </p>
                  </div>
                  <p className="text-sm font-bold text-[#003a4d]">
                    <CurrencyText value={item.totalSales} />
                  </p>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full rounded-lg bg-[#e8f6fe] py-3 text-sm font-bold text-[#003a4d] transition-colors hover:bg-[#d7e5ed]">
              Customer Insight Portal
            </button>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h4 className="mb-4 text-lg font-bold text-[#003a4d]">Top Products</h4>
            <div className="space-y-3">
              {topProducts.slice(0, 3).map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 rounded-lg bg-[#e8f6fe] p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1f6581]">
                    {getInitials(item.name)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#111d23]">{item.name}</p>
                    <p className="text-[10px] text-[#70787d]">Revenue leader</p>
                  </div>
                  <p className="text-sm font-bold text-[#003a4d]">
                    <CurrencyText value={item.revenue} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
