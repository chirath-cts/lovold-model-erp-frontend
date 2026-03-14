import { Link, useParams } from "react-router-dom";

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
    totalSales: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    totalProfit: orders.reduce((sum, order) => sum + order.estimatedProfit, 0),
    totalItems: orderItems
      .filter((item) => orders.some((order) => order.id === item.orderId))
      .reduce((sum, item) => sum + item.quantity, 0),
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/customers" className="font-semibold text-[#00526C]">
          Customers
        </Link>
        <span>/</span>
        <span>{customer.companyName}</span>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#003a4d]">{customer.companyName}</h1>
            <p className="text-sm text-slate-500">{customer.customerCode}</p>
            <p className="mt-2 text-sm text-slate-700">{customer.contactPerson}</p>
            <p className="text-sm text-slate-600">{customer.email}</p>
            <p className="text-sm text-slate-600">{customer.phone}</p>
            <p className="text-sm text-slate-500">{customer.address}</p>
          </div>
          <StatusBadge value={customer.status} />
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Total Orders</p>
            <p className="text-xl font-bold">{totals.totalOrders}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Total Sales</p>
            <p className="text-xl font-bold">
              <CurrencyText value={totals.totalSales} />
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Estimated Profit</p>
            <p className="text-xl font-bold">
              <CurrencyText value={totals.totalProfit} />
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Items Purchased</p>
            <p className="text-xl font-bold">{totals.totalItems}</p>
          </div>
        </div>
      </section>

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
            render: (row) => <CurrencyText value={row.totalAmount} />,
          },
          {
            key: "profit",
            header: "Estimated Profit",
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
    </div>
  );
}
