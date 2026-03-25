import { useState } from "react";
import { Link } from "react-router-dom";

import { useCustomers, useOrderItems, useOrders } from "@/services/hooks/useDomainQueries";
import { CurrencyText } from "@/shared/ui/CurrencyText";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import {
  DataPanel,
  EmptyPanel,
  InventoryPageHeader,
  SummaryCard,
} from "@/features/inventory/shared/InventoryScaffold";
import {
  getCustomerRegion,
  getCustomerSearchTokens,
  getCustomerSummaryMetrics,
} from "@/features/customers/model/customerMetrics";

export function CustomersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [region, setRegion] = useState("");

  const customersQuery = useCustomers();
  const ordersQuery = useOrders();
  const orderItemsQuery = useOrderItems();

  if (customersQuery.isLoading || ordersQuery.isLoading || orderItemsQuery.isLoading) {
    return <LoadingState label="Loading customer directory..." />;
  }

  if (customersQuery.isError || ordersQuery.isError || orderItemsQuery.isError) {
    return <ErrorState title="Could not load the customer directory." />;
  }

  const customers = customersQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const orderItems = orderItemsQuery.data ?? [];

  const regions = Array.from(
    new Set(customers.map((customer) => getCustomerRegion(customer.address))),
  ).sort((left, right) => left.localeCompare(right));

  const rows = customers
    .map((customer) => {
      const customerOrders = orders.filter((order) => order.customerId === customer.id);
      const summary = getCustomerSummaryMetrics(customerOrders, orderItems);
      return {
        customer,
        region: getCustomerRegion(customer.address),
        summary,
        searchTokens: getCustomerSearchTokens(customer),
      };
    })
    .filter((row) => {
      if (search.trim() && !row.searchTokens.includes(search.toLowerCase().trim())) {
        return false;
      }

      if (status && row.customer.status !== status) {
        return false;
      }

      if (region && row.region !== region) {
        return false;
      }

      return true;
    });

  const totalRevenue = rows.reduce((sum, row) => sum + row.summary.revenue, 0);
  const totalOrders = rows.reduce((sum, row) => sum + row.summary.orderCount, 0);
  const activeCustomers = rows.filter((row) => row.customer.status === "active").length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="app-page">
      <InventoryPageHeader
        eyebrow="Sales / Customers"
        title="Customers"
        description="Track Lovold aquaculture accounts, order history, sales performance, and the regions these long-term partners operate from."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <SummaryCard
          label="Total customers"
          value={String(customers.length)}
          supporting="Accounts in the current directory."
        />
        <SummaryCard
          label="Active accounts"
          value={String(activeCustomers)}
          supporting="Accounts available for new commercial activity."
        />
        <SummaryCard
          label="Lifetime revenue"
          value={
            new Intl.NumberFormat("nb-NO", {
              style: "currency",
              currency: "NOK",
              maximumFractionDigits: 0,
            }).format(totalRevenue)
          }
          tone="brand"
          supporting="Revenue across filtered customer accounts."
        />
        <SummaryCard
          label="Average order value"
          value={
            new Intl.NumberFormat("nb-NO", {
              style: "currency",
              currency: "NOK",
              maximumFractionDigits: 0,
            }).format(avgOrderValue)
          }
          tone="warning"
          supporting="Average across all customer orders."
        />
      </div>

      <DataPanel
        title="Directory filters"
        description="Search by customer code, business name, contact details, or address. Narrow the list by lifecycle status and region."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="app-label">Search</span>
            <input
              className="app-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="FjordBlue, CUS-1001, procurement..."
            />
          </label>
          <label className="space-y-2">
            <span className="app-label">Status</span>
            <select
              className="app-select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="app-label">Region</span>
            <select
              className="app-select"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
            >
              <option value="">All regions</option>
              {regions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
      </DataPanel>

      {rows.length === 0 ? (
        <EmptyPanel
          title="No customers match these filters"
          copy="Try widening the search or clearing one of the active filters."
        />
      ) : (
        <DataPanel
          title="Customer directory"
          description="Commercial accounts with their order history, revenue, profit, and regional footprint."
        >
          <div className="app-table-shell">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Customer</th>
                  <th>Region</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                  <th>Profit</th>
                  <th>Last order</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map(({ customer, region: customerRegion, summary }) => (
                  <tr key={customer.id}>
                    <td className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                      {customer.customerCode}
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="font-medium text-[var(--text-primary)]">{customer.name}</div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {customer.email}
                        </div>
                      </div>
                    </td>
                    <td>{customerRegion}</td>
                    <td>{summary.orderCount}</td>
                    <td>
                      <CurrencyText value={summary.revenue} />
                    </td>
                    <td>
                      <CurrencyText value={summary.profit} />
                    </td>
                    <td>{summary.lastOrderDate ? new Date(summary.lastOrderDate).toLocaleDateString("en-GB") : "Not available"}</td>
                    <td>
                      <StatusBadge value={customer.status} />
                    </td>
                    <td className="text-right">
                      <Link
                        className="text-sm font-semibold text-[var(--brand-900)] hover:underline"
                        to={`/customers/${customer.id}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataPanel>
      )}
    </div>
  );
}
