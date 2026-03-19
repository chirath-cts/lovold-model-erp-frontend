import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  Link,
  Stack,
  Typography,
} from "@mui/material";

import { useCustomerById, useOrderItems, useOrders } from "@/services/hooks/useDomainQueries";
import { formatDate } from "@/shared/lib/format";
import { CurrencyText } from "@/shared/ui/CurrencyText";
import { DataTable } from "@/shared/ui/DataTable";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { StatusBadge } from "@/shared/ui/StatusBadge";

export function CustomerDetailsPage() {
  const { customerId } = useParams();

  const customerQuery = useCustomerById(customerId);
  const ordersQuery = useOrders({ customerId });
  const orderItemsQuery = useOrderItems();

  const customer = customerQuery.data;
  const orders = ordersQuery.data ?? [];
  const orderItems = orderItemsQuery.data ?? [];

  if (customerQuery.isLoading || ordersQuery.isLoading || orderItemsQuery.isLoading) {
    return <LoadingState label="Loading customer details..." />;
  }

  if (customerQuery.error || ordersQuery.error || orderItemsQuery.error) {
    return <ErrorState message="Failed to load customer details." />;
  }

  if (!customer) {
    return <ErrorState message="Customer not found." />;
  }

  const totals = {
    totalOrders: orders.length,
    totalSales: orders.reduce((sum, order) => sum + order.grandTotal, 0),
    totalProfit: orders.reduce((sum, order) => sum + order.profitTotal, 0),
    totalItems: orderItems
      .filter((item) => orders.some((order) => order.id === item.orderId))
      .reduce((sum, item) => sum + item.quantity, 0),
  };

  return (
    <Stack spacing={3}>
      <Breadcrumbs separator="/" aria-label="breadcrumb">
        <Link component={RouterLink} to="/customers" underline="hover" color="primary" fontWeight={700}>
          Customers
        </Link>
        <Typography color="text.secondary">{customer.companyName}</Typography>
      </Breadcrumbs>

      <Card>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="h1" sx={{ mb: 0.5 }}>
                {customer.companyName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {customer.customerCode}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1.5 }}>
                {customer.contactPerson}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {customer.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {customer.phone}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {customer.address}
              </Typography>
            </Box>
            <StatusBadge value={customer.status} />
          </Box>

          <Box
            sx={{
              mt: 3,
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(4, minmax(0, 1fr))" },
            }}
          >
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Total Orders
                </Typography>
                <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
                  {totals.totalOrders}
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Total Sales
                </Typography>
                <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
                  <CurrencyText value={totals.totalSales} />
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Estimated Profit
                </Typography>
                <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
                  <CurrencyText value={totals.totalProfit} />
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Items Purchased
                </Typography>
                <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
                  {totals.totalItems}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </CardContent>
      </Card>

      <DataTable
        rows={orders}
        rowKey={(row) => row.id}
        columns={[
          {
            key: "order",
            header: "Order Number",
            render: (row) => row.orderNumber,
          },
          {
            key: "date",
            header: "Date",
            render: (row) => formatDate(row.orderDate),
          },
          {
            key: "amount",
            header: "Total Amount",
            align: "right",
            render: (row) => <CurrencyText value={row.grandTotal} />,
          },
          {
            key: "profit",
            header: "Estimated Profit",
            align: "right",
            render: (row) => <CurrencyText value={row.profitTotal} />,
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge value={row.status} />,
          },
        ]}
      />
    </Stack>
  );
}
