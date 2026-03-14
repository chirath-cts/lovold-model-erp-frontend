import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getDashboardMetrics, getTopCustomers, getTopProducts } from "@/features/dashboard/model/dashboardSelectors";
import { useCustomers, useOrderItems, useOrders, useProducts } from "@/services/hooks/useDomainQueries";
import { formatDate } from "@/shared/lib/format";
import { CurrencyText } from "@/shared/ui/CurrencyText";
import { ErrorState } from "@/shared/ui/ErrorState";
import { KpiCard } from "@/shared/ui/KpiCard";
import { LoadingState } from "@/shared/ui/LoadingState";
import { MetricPanel } from "@/shared/ui/MetricPanel";
import { StatusBadge } from "@/shared/ui/StatusBadge";

export function DashboardPage() {
  const ordersQuery = useOrders();
  const productsQuery = useProducts();
  const customersQuery = useCustomers();
  const orderItemsQuery = useOrderItems();

  const orders = ordersQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const customers = customersQuery.data ?? [];
  const orderItems = orderItemsQuery.data ?? [];

  if (ordersQuery.isLoading || productsQuery.isLoading || customersQuery.isLoading || orderItemsQuery.isLoading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (ordersQuery.error || productsQuery.error || customersQuery.error || orderItemsQuery.error) {
    return <ErrorState message="Failed to load dashboard data." />;
  }

  const metrics = getDashboardMetrics(orders, products, customers);

  const salesTrend = orders
    .slice()
    .sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime())
    .map((order) => ({
      name: formatDate(order.orderDate),
      sales: order.totalAmount,
    }))
    .slice(-10);

  const statusMap = new Map<string, number>();
  orders.forEach((order) => statusMap.set(order.status, (statusMap.get(order.status) ?? 0) + 1));
  const orderStatusData = [...statusMap.entries()].map(([status, count]) => ({ status, count }));

  const topCustomers = getTopCustomers(orders, customers);
  const topProducts = getTopProducts(orderItems, products);
  const lowStockProducts = products
    .filter((product) => product.stockQuantity <= product.reorderLevel)
    .sort((a, b) => a.stockQuantity - b.stockQuantity)
    .slice(0, 6);

  const recentOrders = orders.slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#003a4d]">Enterprise Overview</h1>
        <p className="text-sm text-slate-500">Real-time operational and sales visibility for Lovold.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Total Sales" value={<CurrencyText value={metrics.totalSales} />} tone="accent" />
        <KpiCard label="Total Orders" value={metrics.totalOrders} />
        <KpiCard label="Estimated Profit" value={<CurrencyText value={metrics.estimatedProfit} />} />
        <KpiCard label="Low Stock" value={metrics.lowStockCount} tone="warn" />
        <KpiCard label="Active Customers" value={metrics.activeCustomers} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <MetricPanel title="Sales Trend">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => Number(value ?? 0).toLocaleString("nb-NO")} />
                <Line type="monotone" dataKey="sales" stroke="#00526C" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </MetricPanel>

        <MetricPanel title="Orders by Status">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1f6581" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MetricPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <MetricPanel title="Recent Orders">
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{order.orderNumber}</p>
                  <p className="text-xs text-slate-500">{formatDate(order.orderDate)}</p>
                </div>
                <div className="text-right">
                  <CurrencyText className="text-sm font-semibold text-slate-800" value={order.totalAmount} />
                  <div className="mt-1">
                    <StatusBadge value={order.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </MetricPanel>

        <MetricPanel title="Low Stock Products">
          <div className="space-y-2">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-sm font-semibold text-slate-800">{product.name}</p>
                <p className="text-xs text-slate-600">
                  {product.stockQuantity} in stock / reorder at {product.reorderLevel}
                </p>
              </div>
            ))}
          </div>
        </MetricPanel>

        <MetricPanel title="Top Customers & Products">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Top Customers</p>
              <div className="space-y-2">
                {topCustomers.slice(0, 3).map((item) => (
                  <div key={item.customerId} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                    <p className="text-sm text-slate-700">{item.companyName}</p>
                    <CurrencyText className="text-sm font-semibold" value={item.totalSales} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Top Products</p>
              <div className="space-y-2">
                {topProducts.slice(0, 3).map((item) => (
                  <div key={item.productId} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                    <p className="text-sm text-slate-700">{item.name}</p>
                    <CurrencyText className="text-sm font-semibold" value={item.revenue} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </MetricPanel>
      </div>
    </div>
  );
}
