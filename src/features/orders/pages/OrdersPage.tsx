import { useState } from "react";

import { queryClient } from "@/app/queryClient";
import { CreateOrderModal } from "@/features/orders/components/CreateOrderModal";
import { useCustomers, useDiscounts, useOrders, useProducts } from "@/services/hooks/useDomainQueries";
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
  const discountsQuery = useDiscounts();

  const orders = ordersQuery.data ?? [];
  const customers = customersQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const discounts = discountsQuery.data ?? [];

  if (ordersQuery.isLoading || customersQuery.isLoading || productsQuery.isLoading || discountsQuery.isLoading) {
    return <LoadingState label="Loading orders..." />;
  }

  if (ordersQuery.error || customersQuery.error || productsQuery.error || discountsQuery.error) {
    return <ErrorState message="Failed to load orders data." />;
  }

  const customerLookup = new Map(customers.map((customer) => [customer.id, customer.companyName]));

  const totals = {
    revenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    profit: orders.reduce((sum, order) => sum + order.estimatedProfit, 0),
    active: orders.filter((order) => order.status === "confirmed" || order.status === "dispatched").length,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#003a4d]">Sales Orders</h1>
          <p className="text-sm text-slate-500">Manage lifecycle and create orders with live stock impact.</p>
        </div>
        <button className="rounded-lg bg-[#00526C] px-4 py-2 text-sm font-semibold text-white" onClick={() => setOpenModal(true)}>
          Create Order
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active Orders</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totals.active}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Revenue</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            <CurrencyText value={totals.revenue} />
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimated Profit</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            <CurrencyText value={totals.profit} />
          </p>
        </div>
      </div>

      <FilterBar>
        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={status}
          onChange={(event) => setStatus(event.target.value as StatusFilter)}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="confirmed">Confirmed</option>
          <option value="dispatched">Dispatched</option>
          <option value="delivered">Delivered</option>
        </select>
      </FilterBar>

      <DataTable
        rows={orders}
        rowKey={(row) => row.id}
        columns={[
          {
            key: "order",
            header: "Order",
            render: (row) => (
              <div>
                <p className="font-semibold text-slate-800">{row.orderNumber}</p>
                <p className="text-xs text-slate-500">{formatDate(row.orderDate)}</p>
              </div>
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
            render: (row) => <CurrencyText value={row.totalAmount} />,
          },
          {
            key: "profit",
            header: "Profit",
            align: "right",
            render: (row) => <CurrencyText value={row.estimatedProfit} />,
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
        discounts={discounts}
        orders={orders}
      />
    </div>
  );
}
