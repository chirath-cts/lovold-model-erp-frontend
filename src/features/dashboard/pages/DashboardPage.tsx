import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import {
  Box,
  List,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  getDashboardMetrics,
  getTopCustomers,
  getTopProducts,
} from "@/features/dashboard/model/dashboardSelectors";
import {
  useCustomers,
  useOrderItems,
  useOrders,
  useProducts,
} from "@/services/hooks/useDomainQueries";
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

  if (
    ordersQuery.isLoading ||
    productsQuery.isLoading ||
    customersQuery.isLoading ||
    orderItemsQuery.isLoading
  ) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (
    ordersQuery.error ||
    productsQuery.error ||
    customersQuery.error ||
    orderItemsQuery.error
  ) {
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
  orders.forEach((order) =>
    statusMap.set(order.status, (statusMap.get(order.status) ?? 0) + 1),
  );
  const orderStatusData = [...statusMap.entries()].map(([status, count]) => ({
    status,
    count,
  }));

  const topCustomers = getTopCustomers(orders, customers);
  const topProducts = getTopProducts(orderItems, products);
  const lowStockProducts = products
    .filter((product) => product.stockQuantity <= product.reorderLevel)
    .sort((a, b) => a.stockQuantity - b.stockQuantity)
    .slice(0, 6);

  const recentOrders = orders.slice(0, 6);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h1">Enterprise Overview</Typography>
        <Typography variant="body2" color="text.secondary">
          Real-time operational and sales visibility for Lovold.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(5, minmax(0, 1fr))",
          },
        }}
      >
        <KpiCard
          label="Total Sales"
          value={<CurrencyText value={metrics.totalSales} />}
          tone="accent"
        />
        <KpiCard label="Total Orders" value={metrics.totalOrders} />
        <KpiCard
          label="Estimated Profit"
          value={<CurrencyText value={metrics.estimatedProfit} />}
        />
        <KpiCard label="Low Stock" value={metrics.lowStockCount} tone="warn" />
        <KpiCard label="Active Customers" value={metrics.activeCustomers} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", xl: "repeat(2, minmax(0, 1fr))" },
        }}
      >
        <MetricPanel title="Sales Trend">
          <LineChart
            height={260}
            xAxis={[{ scaleType: "point", data: salesTrend.map((item) => item.name) }]}
            series={[
              {
                data: salesTrend.map((item) => item.sales),
                label: "Sales",
                color: "#00526C",
              },
            ]}
            margin={{ top: 16, right: 16, left: 20, bottom: 24 }}
          />
        </MetricPanel>

        <MetricPanel title="Orders by Status">
          <BarChart
            height={260}
            xAxis={[{ scaleType: "band", data: orderStatusData.map((item) => item.status) }]}
            series={[{ data: orderStatusData.map((item) => item.count), color: "#1f6581" }]}
            margin={{ top: 16, right: 16, left: 20, bottom: 24 }}
          />
        </MetricPanel>
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", xl: "repeat(3, minmax(0, 1fr))" },
        }}
      >
        <MetricPanel title="Recent Orders">
          <List disablePadding>
            {recentOrders.map((order) => (
              <Paper
                key={order.id}
                variant="outlined"
                sx={{
                  p: 1.5,
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {order.orderNumber}
                    </Typography>
                  }
                  secondary={formatDate(order.orderDate)}
                  sx={{ m: 0 }}
                />
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    <CurrencyText value={order.totalAmount} />
                  </Typography>
                  <StatusBadge value={order.status} />
                </Box>
              </Paper>
            ))}
          </List>
        </MetricPanel>

        <MetricPanel title="Low Stock Products">
          <List disablePadding>
            {lowStockProducts.map((product) => (
              <Paper
                key={product.id}
                variant="outlined"
                sx={{
                  p: 1.5,
                  mb: 1,
                  borderColor: "warning.light",
                  bgcolor: "rgba(255, 208, 129, 0.12)",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {product.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {product.stockQuantity} in stock / reorder at {product.reorderLevel}
                </Typography>
              </Paper>
            ))}
          </List>
        </MetricPanel>

        <MetricPanel title="Top Customers & Products">
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              Top Customers
            </Typography>
            <List disablePadding sx={{ mb: 2 }}>
              {topCustomers.slice(0, 3).map((item) => (
                <Paper
                  key={item.customerId}
                  variant="outlined"
                  sx={{ p: 1.5, mb: 1, display: "flex", justifyContent: "space-between" }}
                >
                  <Typography variant="body2">{item.companyName}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    <CurrencyText value={item.totalSales} />
                  </Typography>
                </Paper>
              ))}
            </List>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              Top Products
            </Typography>
            <List disablePadding>
              {topProducts.slice(0, 3).map((item) => (
                <Paper
                  key={item.productId}
                  variant="outlined"
                  sx={{ p: 1.5, mb: 1, display: "flex", justifyContent: "space-between" }}
                >
                  <Typography variant="body2">{item.name}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    <CurrencyText value={item.revenue} />
                  </Typography>
                </Paper>
              ))}
            </List>
          </Box>
        </MetricPanel>
      </Box>
    </Stack>
  );
}
