import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Link, Stack, Typography } from "@mui/material";

import { buildCustomerAggregates } from "@/features/customers/model/customerSelectors";
import { useCustomers, useOrders } from "@/services/hooks/useDomainQueries";
import { formatDate } from "@/shared/lib/format";
import { CurrencyText } from "@/shared/ui/CurrencyText";
import { DataTable } from "@/shared/ui/DataTable";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { SearchInput } from "@/shared/ui/SearchInput";
import { StatusBadge } from "@/shared/ui/StatusBadge";

export function CustomersPage() {
  const [search, setSearch] = useState("");
  const customersQuery = useCustomers();
  const ordersQuery = useOrders();

  const customers = customersQuery.data ?? [];
  const orders = ordersQuery.data ?? [];

  if (customersQuery.isLoading || ordersQuery.isLoading) {
    return <LoadingState label="Loading customers..." />;
  }

  if (customersQuery.error || ordersQuery.error) {
    return <ErrorState message="Failed to load customers." />;
  }

  const aggregateLookup = new Map(
    buildCustomerAggregates(customers, orders).map((item) => [item.customerId, item]),
  );

  const rows = customers.filter((customer) =>
    [customer.companyName, customer.contactPerson, customer.customerCode]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h1">Customer Network</Typography>
        <Typography variant="body2" color="text.secondary">
          Commercial view of customers, sales and order performance.
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 420 }}>
        <SearchInput placeholder="Search customers..." value={search} onChange={setSearch} />
      </Box>

      <DataTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={[
          {
            key: "code",
            header: "Customer",
            render: (row) => (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {row.companyName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.customerCode}
                </Typography>
              </Box>
            ),
          },
          {
            key: "contact",
            header: "Contact",
            render: (row) => (
              <Box>
                <Typography variant="body2">{row.contactPerson}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.country}
                </Typography>
              </Box>
            ),
          },
          {
            key: "orders",
            header: "Orders",
            align: "right",
            render: (row) => aggregateLookup.get(row.id)?.totalOrders ?? 0,
          },
          {
            key: "sales",
            header: "Total Sales",
            align: "right",
            render: (row) => <CurrencyText value={aggregateLookup.get(row.id)?.totalSales ?? 0} />,
          },
          {
            key: "lastOrder",
            header: "Last Order",
            render: (row) => {
              const lastOrderDate = aggregateLookup.get(row.id)?.lastOrderDate;
              return lastOrderDate ? formatDate(lastOrderDate) : "-";
            },
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge value={row.status} />,
          },
          {
            key: "action",
            header: "",
            align: "right",
            render: (row) => (
              <Link component={RouterLink} to={`/customers/${row.id}`} underline="hover" fontWeight={700}>
                View
              </Link>
            ),
          },
        ]}
      />
    </Stack>
  );
}
