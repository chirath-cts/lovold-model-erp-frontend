import { useState } from "react";
import { Link } from "react-router-dom";

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

  if (customersQuery.isLoading || ordersQuery.isLoading) return <LoadingState label="Loading customers..." />;
  if (customersQuery.error || ordersQuery.error) return <ErrorState message="Failed to load customers." />;

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
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#003a4d]">Customer Network</h1>
          <p className="text-sm text-slate-500">Commercial view of customers, sales and order performance.</p>
        </div>
      </div>

      <div className="max-w-md">
        <SearchInput placeholder="Search customers..." value={search} onChange={setSearch} />
      </div>

      <DataTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={[
          {
            key: "code",
            header: "Customer",
            render: (row) => (
              <div>
                <p className="font-semibold text-slate-800">{row.companyName}</p>
                <p className="text-xs text-slate-500">{row.customerCode}</p>
              </div>
            ),
          },
          {
            key: "contact",
            header: "Contact",
            render: (row) => (
              <div>
                <p>{row.contactPerson}</p>
                <p className="text-xs text-slate-500">{row.country}</p>
              </div>
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
              <Link className="text-sm font-semibold text-[#00526C]" to={`/customers/${row.id}`}>
                View
              </Link>
            ),
          },
        ]}
      />
    </div>
  );
}
