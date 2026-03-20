import type { ReactNode } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { SxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

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
import { LoadingState } from "@/shared/ui/LoadingState";
import { StatusBadge } from "@/shared/ui/StatusBadge";

const designPalette = {
  background: "#f4faff",
  surface: "#ffffff",
  surfaceLow: "#e8f6fe",
  primary: "#003a4d",
  primaryContainer: "#00526c",
  primaryFixed: "#bfe8ff",
  secondary: "#1f6581",
  outline: "rgba(192, 200, 205, 0.35)",
  muted: "#70787d",
  error: "#ba1a1a",
};

const PageContainer = styled(Stack)(({ theme }) => ({
  backgroundColor: designPalette.background,
  minHeight: "100vh",
  padding: theme.spacing(3),
  gap: theme.spacing(3),
}));

const SectionCard = styled(Paper)(({ theme }) => ({
  backgroundColor: designPalette.surface,
  borderRadius: 16,
  boxShadow: "0px 10px 30px rgba(0, 58, 77, 0.06)",
  padding: theme.spacing(3),
}));

const KpiCardSurface = styled(SectionCard)(() => ({
  display: "flex",
  flexDirection: "column",
  gap: 12,
  height: "100%",
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
}));

const RangeGroup = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 4,
  backgroundColor: designPalette.surfaceLow,
  borderRadius: 12,
}));

const RangeButton = styled(Button)(() => ({
  textTransform: "none",
  fontWeight: 600,
  fontSize: 14,
  borderRadius: 8,
  padding: "8px 16px",
  minHeight: "auto",
  boxShadow: "none",
}));

const IconFrame = styled(IconButton)(() => ({
  padding: 8,
  backgroundColor: "transparent",
  color: designPalette.muted,
  boxShadow: "none",
  "&:hover": {
    color: designPalette.primary,
    backgroundColor: "transparent",
  },
}));

const MutedLabel = styled(Typography)(() => ({
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 1.4,
  textTransform: "uppercase",
  color: designPalette.muted,
}));

const Pill = styled(Chip)(() => ({
  height: 22,
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 10,
}));

const DistributionBar = styled(LinearProgress)(() => ({
  height: 8,
  borderRadius: 999,
  backgroundColor: "rgba(31, 101, 129, 0.14)",
  "& .MuiLinearProgress-bar": {
    borderRadius: 999,
  },
}));

const CardStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
}));

const LowStockItem = styled(Paper)(() => ({
  padding: 12,
  borderRadius: 10,
  backgroundColor: designPalette.surface,
}));

const KpiValue = styled(Typography)(() => ({
  fontSize: 24,
  fontWeight: 800,
  lineHeight: 1.2,
  color: designPalette.primary,
  fontFamily: "'Manrope','Inter',sans-serif",
}));

const KpiHelper = styled(Typography)(() => ({
  fontSize: 12,
  fontWeight: 'normal',
  color:'#70787d',
  fontFamily: "'Inter',sans-serif",
  marginTop: 4,
  display: "block",
}));

interface DashboardKpiCardProps {
  label: string;
  value: ReactNode;
  badge?: { label: string; color: string; textColor?: string };
  helper?: string;
  cardSx?: SxProps;
}

function DashboardKpiCard({ label, value, badge, helper, cardSx }: DashboardKpiCardProps) {
  return (
    <KpiCardSurface sx={cardSx}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <MutedLabel>{label}</MutedLabel>
        {badge ? (
          <Pill
            size="small"
            label={badge.label}
            sx={{ bgcolor: badge.color, color: badge.textColor ?? "#ffffff" }}
          />
        ) : null}
      </Box>
      <Box sx={{ mt: 2 }}>
        <KpiValue>{value}</KpiValue>
        {helper ? (
          <KpiHelper variant="caption">
            {helper}
          </KpiHelper>
        ) : null}
      </Box>
    </KpiCardSurface>
  );
}

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
  if (normalized === "delivered") return designPalette.primary;
  if (normalized === "dispatched") return designPalette.secondary;
  if (normalized === "confirmed") return "#9eddfd";
  return "rgba(64, 72, 76, 0.45)";
};

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
      sales: order.grandTotal,
    }))
    .slice(-10);
  const salesTrendPoints = salesTrend.length ? salesTrend : [{ name: "No data", sales: 0 }];

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
        (orders.filter((order) => fulfilledStatuses.has(order.status)).length / orders.length) *
          1000,
      ) / 10
    : 0;

  const topCustomers = getTopCustomers(orders, customers);
  const topProducts = getTopProducts(orderItems, products);
  const customerOrderCount = orders.reduce((map, order) => {
    map.set(order.customerId, (map.get(order.customerId) ?? 0) + 1);
    return map;
  }, new Map<string, number>());
  const lowStockProducts = products
    .filter((product) => product.stockQuantity <= product.reorderLevel)
    .sort((a, b) => a.stockQuantity - b.stockQuantity)
    .slice(0, 6);

  const recentOrders = orders
    .slice()
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 6);

  const customerLookup = new Map(customers.map((customer) => [customer.id, customer.companyName]));

  return (
    <PageContainer>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
      >
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: designPalette.primary }}>
            Enterprise Overview
          </Typography>
          <Typography variant="body2" sx={{ color: designPalette.muted }}>
            Real-time performance metrics for aquaculture logistics.
          </Typography>
        </Box>

        <RangeGroup>
          <RangeButton
            variant="contained"
            disableElevation
            sx={{
              bgcolor: designPalette.surface,
              color: designPalette.primary,
              boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.12)",
            }}
          >
            Today
          </RangeButton>
          <RangeButton
            variant="text"
            color="inherit"
            sx={{ color: designPalette.muted, "&:hover": { color: designPalette.primary } }}
          >
            Week
          </RangeButton>
          <RangeButton
            variant="text"
            color="inherit"
            sx={{ color: designPalette.muted, "&:hover": { color: designPalette.primary } }}
          >
            Month
          </RangeButton>
          <Divider flexItem orientation="vertical" sx={{ opacity: 0.4, height: 16 }} />
          <IconFrame size="small">
            <CalendarTodayRoundedIcon fontSize="small" />
          </IconFrame>
        </RangeGroup>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(5, minmax(0, 1fr))",
          },
        }}
      >
        <DashboardKpiCard
          label="Total Sales"
          value={<CurrencyText value={metrics.totalSales} />}
          badge={{ label: "+12%", color: designPalette.primaryFixed, textColor: designPalette.primaryContainer }}
          helper="vs. last period"
          cardSx={{
            boxShadow: "0px 4px 20px rgba(0, 58, 77, 0.03)",
            backgroundColor: designPalette.surface,
          }}
        />
        <DashboardKpiCard
          label="Total Orders"
          value={metrics.totalOrders}
          badge={{ label: "Ops", color: designPalette.surfaceLow, textColor: designPalette.primary }}
          helper="All statuses"
        />
        <DashboardKpiCard
          label="Estimated Profit"
          value={<CurrencyText value={metrics.profitTotal} />}
          badge={{ label: "Stable", color: "#9eddfd", textColor: designPalette.primary }}
          helper="Aggregate profit"
        />
        <DashboardKpiCard
          label="Low Stock"
          value={metrics.lowStockCount}
          badge={{ label: "Action", color: "#ffdad6", textColor: designPalette.error }}
          helper="At/below reorder level"
        />
        <DashboardKpiCard
          label="Active Customers"
          value={metrics.activeCustomers}
          badge={{ label: "CRM", color: "#d7e5ed", textColor: designPalette.primary }}
          helper="Status: active"
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", xl: "repeat(3, minmax(0, 1fr))" },
        }}
      >
        <SectionCard sx={{ gridColumn: { xs: "1", xl: "span 2" } }}>
          <SectionHeader>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: designPalette.primary }}>
                Sales Trend
              </Typography>
              <Typography variant="body2" sx={{ color: designPalette.muted }}>
                Revenue performance over time
              </Typography>
            </Box>
            <Button variant="text" sx={{ color: designPalette.primary, fontWeight: 700 }}>
              View report
            </Button>
          </SectionHeader>
          <Box sx={{ height: 280 }}>
            <LineChart
              height={260}
              xAxis={[{ scaleType: "point", data: salesTrendPoints.map((item) => item.name) }]}
              series={[
                {
                  data: salesTrendPoints.map((item) => item.sales),
                  label: "Sales",
                  color: designPalette.primary,
                },
              ]}
              margin={{ top: 16, right: 16, left: 20, bottom: 24 }}
            />
          </Box>
        </SectionCard>

        <SectionCard>
          <Typography variant="h6" sx={{ fontWeight: 800, color: designPalette.primary, mb: 0.5 }}>
            Order Distribution
          </Typography>
          <Typography variant="body2" sx={{ color: designPalette.muted, mb: 2 }}>
            Current status breakdown
          </Typography>
          <CardStack>
            {orderStatusDistribution.map((item) => (
              <Box key={item.status}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: designPalette.primary }}>
                    {item.status}
                  </Typography>
                  <Typography variant="body2" sx={{ color: designPalette.muted }}>
                    {item.count}
                  </Typography>
                </Box>
                <DistributionBar
                  variant="determinate"
                  value={item.percent}
                  sx={{ "& .MuiLinearProgress-bar": { backgroundColor: item.color } }}
                />
              </Box>
            ))}
          </CardStack>
          <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${designPalette.outline}` }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "rgba(31,101,129,0.12)", color: designPalette.secondary }}>
                <VerifiedRoundedIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: designPalette.muted }}>
                  Fulfillment Rate
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: designPalette.primary }}>
                  {fulfillmentRate.toFixed(1)}%
                </Typography>
              </Box>
            </Stack>
          </Box>
        </SectionCard>
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", xl: "repeat(3, minmax(0, 1fr))" },
        }}
      >
        <SectionCard sx={{ gridColumn: { xs: "1", xl: "span 2" }, overflow: "hidden" }}>
          <SectionHeader sx={{ mb: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: designPalette.primary }}>
              Recent Orders
            </Typography>
            <Button variant="text" sx={{ color: designPalette.primary, fontWeight: 700 }}>
              See all orders
            </Button>
          </SectionHeader>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <MutedLabel>ID</MutedLabel>
                </TableCell>
                <TableCell>
                  <MutedLabel>Customer</MutedLabel>
                </TableCell>
                <TableCell>
                  <MutedLabel>Date</MutedLabel>
                </TableCell>
                <TableCell>
                  <MutedLabel>Amount</MutedLabel>
                </TableCell>
                <TableCell>
                  <MutedLabel>Status</MutedLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: designPalette.primary }}>
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: designPalette.surfaceLow, color: designPalette.primary }}>
                        {getInitials(customerLookup.get(order.customerId) ?? "NA")}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {customerLookup.get(order.customerId) ?? "Unknown customer"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: designPalette.muted }}>
                          Ref: {order.customerId}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: designPalette.muted }}>{formatDate(order.orderDate)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <CurrencyText value={order.grandTotal} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={order.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>

        <Stack spacing={3}>
          <SectionCard sx={{ backgroundColor: designPalette.surfaceLow }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: designPalette.primary, mb: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <WarningAmberRoundedIcon sx={{ color: designPalette.error }} />
                Low Stock Products
              </Stack>
            </Typography>
            <CardStack>
              {lowStockProducts.map((product) => (
                <LowStockItem key={product.id} elevation={0}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: designPalette.muted }}>
                        SKU: {product.sku}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: designPalette.error }}>
                        {product.stockQuantity} left
                      </Typography>
                      <Button size="small" sx={{ fontWeight: 800, color: designPalette.primary }}>
                        Restock
                      </Button>
                    </Box>
                  </Stack>
                </LowStockItem>
              ))}
            </CardStack>
          </SectionCard>

          <SectionCard>
            <Typography variant="h6" sx={{ fontWeight: 800, color: designPalette.primary, mb: 2 }}>
              Top Customers & Products
            </Typography>
            <Typography variant="subtitle2" sx={{ color: designPalette.muted, mb: 1 }}>
              Top Customers
            </Typography>
            <CardStack>
              {topCustomers.slice(0, 3).map((item) => (
                <Stack
                  key={item.customerId}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ p: 1.5, borderRadius: 10, bgcolor: designPalette.surfaceLow }}
                >
                  <Avatar sx={{ bgcolor: designPalette.surface, color: designPalette.primary }}>
                    {getInitials(item.companyName)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {item.companyName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: designPalette.muted }}>
                      Orders: {customerOrderCount.get(item.customerId) ?? 0}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: designPalette.primary }}>
                    <CurrencyText value={item.totalSales} />
                  </Typography>
                </Stack>
              ))}
            </CardStack>

            <Divider sx={{ my: 2, borderColor: designPalette.outline }} />

            <Typography variant="subtitle2" sx={{ color: designPalette.muted, mb: 1 }}>
              Top Products
            </Typography>
            <CardStack>
              {topProducts.slice(0, 3).map((item) => (
                <Stack
                  key={item.productId}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ p: 1.25, borderRadius: 10, bgcolor: designPalette.surfaceLow }}
                >
                  <Avatar sx={{ bgcolor: designPalette.surface, color: designPalette.secondary }}>
                    {getInitials(item.name)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: designPalette.muted }}>
                      Revenue leader
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: designPalette.primary }}>
                    <CurrencyText value={item.revenue} />
                  </Typography>
                </Stack>
              ))}
            </CardStack>
          </SectionCard>
        </Stack>
      </Box>
    </PageContainer>
  );
}
