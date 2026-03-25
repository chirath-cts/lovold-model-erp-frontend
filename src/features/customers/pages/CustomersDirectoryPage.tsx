import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  useCustomers,
  useOrderItems,
  useOrders,
} from "@/services/hooks/useDomainQueries";
import { formatDate, formatNok } from "@/shared/lib/format";
import { CustomersIcon, SearchIcon } from "@/shared/ui/icons";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { LoadingState } from "@/shared/ui/LoadingState";
import { ErrorState } from "@/shared/ui/ErrorState";
import {
  buildCustomerDirectoryRows,
  getCustomerRegion,
} from "../model/customerAnalytics";

function MetricCard({
  title,
  value,
  caption,
}: {
  title: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="app-kpi-card">
      <div className="app-kpi-label">{title}</div>
      <div className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
        {value}
      </div>
      <div className="mt-2 text-sm font-medium text-[var(--text-secondary)]">{caption}</div>
    </div>
  );
}

export function CustomersDirectoryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");

  const customersQuery = useCustomers();
  const ordersQuery = useOrders();
  const orderItemsQuery = useOrderItems();

  const rows = useMemo(
    () =>
      buildCustomerDirectoryRows(
        customersQuery.data ?? [],
        ordersQuery.data ?? [],
        orderItemsQuery.data ?? [],
      ),
    [customersQuery.data, orderItemsQuery.data, ordersQuery.data],
  );

  const regions = useMemo(
    () => Array.from(new Set(rows.map((row) => getCustomerRegion(row.address)))).sort(),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        !needle ||
        row.name.toLowerCase().includes(needle) ||
        row.customerCode.toLowerCase().includes(needle) ||
        row.email.toLowerCase().includes(needle) ||
        row.phone.toLowerCase().includes(needle) ||
        row.address.toLowerCase().includes(needle) ||
        row.region.toLowerCase().includes(needle);
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const matchesRegion = regionFilter === "all" || row.region === regionFilter;
      return matchesSearch && matchesStatus && matchesRegion;
    });
  }, [regionFilter, rows, search, statusFilter]);

  const summary = useMemo(() => {
    const totalCustomers = rows.length;
    const activeCustomers = rows.filter((row) => row.status === "active").length;
    const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);
    const totalOrders = rows.reduce((sum, row) => sum + row.orderCount, 0);

    return {
      totalCustomers,
      activeCustomers,
      totalRevenue,
      totalOrders,
    };
  }, [rows]);

  if (customersQuery.isLoading || ordersQuery.isLoading || orderItemsQuery.isLoading) {
    return <LoadingState label="Loading customers..." />;
  }

  if (customersQuery.isError || ordersQuery.isError || orderItemsQuery.isError) {
    return <ErrorState message="Unable to load customers right now." />;
  }

  return (
    <div className="app-page">
      <div className="app-page-header">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            <CustomersIcon className="h-4 w-4 text-[var(--brand-900)]" />
            Sales / Customers
          </div>
          <h1 className="app-page-title">Customer Directory</h1>
          <p className="app-page-copy">
            Lovold’s customer base is relationship-led and project-driven. This directory emphasizes
            account visibility, order volume, and commercial impact across the aquaculture portfolio.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" className="app-button-secondary">
            Export
          </button>
          <button type="button" className="app-button-primary">
            New Customer
          </button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Customers"
          value={String(summary.totalCustomers)}
          caption="Accounts currently in the directory"
        />
        <MetricCard
          title="Active Customers"
          value={String(summary.activeCustomers)}
          caption="Operational accounts with current status"
        />
        <MetricCard
          title="Total Revenue"
          value={formatNok(summary.totalRevenue)}
          caption="Lifetime revenue captured from orders"
        />
        <MetricCard
          title="Total Orders"
          value={String(summary.totalOrders)}
          caption="Recorded orders across the customer base"
        />
      </section>

      <section className="app-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="app-input pl-9"
              placeholder="Search customer ID, name, email, phone, or region"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              className="app-select min-w-40"
              value={regionFilter}
              onChange={(event) => setRegionFilter(event.target.value)}
            >
              <option value="all">All regions</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>

            <select
              className="app-select min-w-40"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </section>

      <section className="app-table-shell">
        <table className="app-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Region</th>
              <th>Orders</th>
              <th>Revenue</th>
              <th>Profit</th>
              <th>Last Order</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className="space-y-1">
                    <div className="font-semibold text-[var(--text-primary)]">{row.name}</div>
                    <div className="text-xs font-medium text-[var(--text-muted)]">
                      {row.customerCode}
                    </div>
                  </div>
                </td>
                <td className="text-[var(--text-secondary)]">{row.region}</td>
                <td className="font-semibold text-[var(--text-primary)]">{row.orderCount}</td>
                <td className="font-semibold text-[var(--text-primary)]">
                  {formatNok(row.revenue)}
                </td>
                <td className="font-semibold text-[var(--text-primary)]">
                  {formatNok(row.profit)}
                </td>
                <td className="text-[var(--text-secondary)]">
                  {row.lastOrderDate ? formatDate(row.lastOrderDate) : "No orders"}
                </td>
                <td>
                  <StatusBadge value={row.status} />
                </td>
                <td className="text-right">
                  <Link
                    to={`/customers/${row.id}`}
                    className="app-button-secondary px-3 py-2 text-xs"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {!filteredRows.length ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-[var(--text-secondary)]">
                  No customers match the current filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="app-card p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Scope
          </div>
          <p className="mt-3 text-sm font-medium text-[var(--text-secondary)]">
            This slice stays lightweight. It surfaces customer identity, commercial scale, and order
            history without expanding into CRM-style master data.
          </p>
        </div>
        <div className="app-card p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Metrics source
          </div>
          <p className="mt-3 text-sm font-medium text-[var(--text-secondary)]">
            Orders and order items remain the source of truth for revenue, profit, and item totals.
          </p>
        </div>
        <div className="app-card p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Regional spread
          </div>
          <p className="mt-3 text-sm font-medium text-[var(--text-secondary)]">
            The directory highlights the aquaculture footprint across Norway, Iceland, Chile, the UK,
            and Canada.
          </p>
        </div>
      </section>
    </div>
  );
}
