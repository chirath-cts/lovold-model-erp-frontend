import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import { queryClient } from "@/app/queryClient";
import { CreateOrderModal } from "@/features/orders/components/CreateOrderModal";
import {
  useCustomerProducts,
  useCustomers,
  useOrders,
  useProducts,
} from "@/services/hooks/useDomainQueries";
import { formatDate } from "@/shared/lib/format";
import { CurrencyText } from "@/shared/ui/CurrencyText";
import { DataTable } from "@/shared/ui/DataTable";
import { ErrorState } from "@/shared/ui/ErrorState";
import { FilterBar } from "@/shared/ui/FilterBar";
import { LoadingState } from "@/shared/ui/LoadingState";
import { StatusBadge } from "@/shared/ui/StatusBadge";

type StatusFilter = "" | "draft" | "confirmed" | "dispatched" | "delivered";

export function OrdersPage() {
  const [status, setStatus] = useState<StatusFilter>("");
  const [openModal, setOpenModal] = useState(false);

  const ordersQuery = useOrders({ status });
  const customersQuery = useCustomers();
  const productsQuery = useProducts();
  const customerProductsQuery = useCustomerProducts();

  const orders = ordersQuery.data ?? [];
  const customers = customersQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const customerProducts = customerProductsQuery.data ?? [];

  if (
    ordersQuery.isLoading ||
    customersQuery.isLoading ||
    productsQuery.isLoading ||
    customerProductsQuery.isLoading
  ) {
    return <LoadingState label="Loading orders..." />;
  }

  if (
    ordersQuery.error ||
    customersQuery.error ||
    productsQuery.error ||
    customerProductsQuery.error
  ) {
    return <ErrorState message="Failed to load orders data." />;
  }

  const customerLookup = new Map(customers.map((customer) => [customer.id, customer.name]));

  const totals = {
    revenue: orders.reduce((sum, order) => sum + order.grandTotal, 0),
    profit: orders.reduce((sum, order) => sum + order.profitTotal, 0),
    active: orders.filter((order) => order.status === "confirmed" || order.status === "dispatched").length,
  };

  return (
    <Stack spacing={3}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h1">Sales Orders</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage lifecycle and create orders with live stock impact.
          </Typography>
        </Box>

        <Button variant="contained" onClick={() => setOpenModal(true)}>
          Create Order
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Active Orders
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
              {totals.active}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Revenue
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
              <CurrencyText value={totals.revenue} />
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Estimated Profit
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
              <CurrencyText value={totals.profit} />
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <FilterBar>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
          >
            <MenuItem value="">All statuses</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="dispatched">Dispatched</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
          </Select>
        </FormControl>
      </FilterBar>

      <DataTable
        rows={orders}
        rowKey={(row) => row.id}
        columns={[
          {
            key: "order",
            header: "Order",
            render: (row) => (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {row.orderNumber}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(row.orderDate)}
                </Typography>
              </Box>
            ),
          },
          {
            key: "customer",
            header: "Customer",
            render: (row) => customerLookup.get(row.customerId) ?? "-",
          },
          {
            key: "amount",
            header: "Total",
            align: "right",
            render: (row) => <CurrencyText value={row.grandTotal} />,
          },
          {
            key: "profit",
            header: "Profit",
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

      <CreateOrderModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          queryClient.invalidateQueries({ queryKey: ["orders"] });
        }}
        customers={customers}
        products={products}
        customerProducts={customerProducts}
        orders={orders}
      />
    </Stack>
  );
}
