import { Link, useParams } from "react-router-dom";

import {
  useCustomerById,
  useOrderItems,
  useOrders,
} from "@/services/hooks/useDomainQueries";
import { CurrencyText } from "@/shared/ui/CurrencyText";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import {
  DataPanel,
  FieldGrid,
  InventoryPageHeader,
  SummaryCard,
} from "@/features/inventory/shared/InventoryScaffold";
import {
  formatDateLabel,
  getCustomerItemMetrics,
  getCustomerRegion,
  getCustomerSummaryMetrics,
  isDelayedCustomerOrder,
} from "@/features/customers/model/customerMetrics";

export function CustomerDetailPage() {
  const { customerId = "" } = useParams();

  const customerQuery = useCustomerById(customerId);
  const ordersQuery = useOrders({ customerId });
  const orderItemsQuery = useOrderItems();

  if (customerQuery.isLoading || ordersQuery.isLoading || orderItemsQuery.isLoading) {
    return <LoadingState label="Loading customer profile..." />;
  }

  if (customerQuery.isError || ordersQuery.isError || orderItemsQuery.isError) {
    return <ErrorState title="Could not load the customer profile." />;
  }

  const customer = customerQuery.data;
  if (!customer) {
    return <ErrorState title="Customer not found." message="The selected customer record does not exist in the current dataset." />;
  }

  const orders = (ordersQuery.data ?? []).slice().sort((left, right) => {
    return new Date(right.orderDate).getTime() - new Date(left.orderDate).getTime();
  });
  const orderItems = orderItemsQuery.data ?? [];

  const summary = getCustomerSummaryMetrics(orders, orderItems);
  const topItems = getCustomerItemMetrics(orders, orderItems);

  return (
    <div className="app-page">
      <InventoryPageHeader
        eyebrow="Sales / Customer profile"
        title={customer.name}
        description={`${customer.customerCode} · ${customer.email} · ${customer.phone}`}
        actions={
          <Link className="app-button-secondary" to="/customers">
            Back to customers
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <SummaryCard
          label="Total orders"
          value={String(summary.orderCount)}
          supporting="Historical orders from the current dataset."
        />
        <SummaryCard
          label="Lifetime revenue"
          value={
            new Intl.NumberFormat("nb-NO", {
              style: "currency",
              currency: "NOK",
              maximumFractionDigits: 0,
            }).format(summary.revenue)
          }
          tone="brand"
          supporting="Total sales across all orders."
        />
        <SummaryCard
          label="Estimated profit"
          value={
            new Intl.NumberFormat("nb-NO", {
              style: "currency",
              currency: "NOK",
              maximumFractionDigits: 0,
            }).format(summary.profit)
          }
          supporting="Calculated from sales and item cost snapshots."
        />
        <SummaryCard
          label="Items purchased"
          value={String(summary.itemQuantity)}
          tone="warning"
          supporting="Total ordered units across all line items."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <DataPanel
          title="Customer profile"
          description="Core account identity and contact information for the Lovold commercial relationship."
        >
          <FieldGrid
            fields={[
              { label: "Customer code", value: customer.customerCode },
              { label: "Status", value: <StatusBadge value={customer.status} /> },
              { label: "Region", value: getCustomerRegion(customer.address) },
              { label: "Email", value: customer.email },
              { label: "Phone", value: customer.phone },
              { label: "Address", value: customer.address },
            ]}
          />
        </DataPanel>

        <DataPanel
          title="Sales profile"
          description="Order history statistics derived from the current order and order-item dataset."
        >
          <FieldGrid
            fields={[
              { label: "Average order value", value: <CurrencyText value={summary.averageOrderValue} /> },
              { label: "Last order", value: formatDateLabel(summary.lastOrderDate) },
              { label: "Delayed orders", value: summary.delayedOrders },
              { label: "Order lines", value: orders.reduce((sum, order) => sum + order.itemCount, 0) },
            ]}
          />
        </DataPanel>
      </div>

      <DataPanel
        title="Order history"
        description="Recent and historical orders for this customer, including commercial totals and fulfillment state."
      >
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-[var(--surface-muted)] px-4 py-8 text-sm text-[var(--text-secondary)]">
            No orders are linked to this customer yet.
          </div>
        ) : (
          <div className="app-table-shell">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Profit</th>
                  <th>Promised ETA</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  return (
                    <tr key={order.id}>
                      <td className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                        {order.orderNumber}
                      </td>
                      <td>{formatDateLabel(order.orderDate)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <StatusBadge value={order.status} />
                          {isDelayedCustomerOrder(order) ? (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                              delayed
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td>{order.itemCount}</td>
                      <td>
                        <CurrencyText value={order.grandTotal} />
                      </td>
                      <td>
                        <CurrencyText value={order.profitTotal} />
                      </td>
                      <td>{formatDateLabel(order.promisedEta)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DataPanel>

      <DataPanel
        title="Top ordered items"
        description="The items most frequently sold to this customer, aggregated from product and component line items."
      >
        {topItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-[var(--surface-muted)] px-4 py-8 text-sm text-[var(--text-secondary)]">
            No line-item history is available for this customer yet.
          </div>
        ) : (
          <div className="app-table-shell">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Revenue</th>
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((item) => (
                  <tr key={item.itemId}>
                    <td>
                      <div className="space-y-1">
                        <div className="font-medium text-[var(--text-primary)]">{item.itemName}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{item.itemSku}</div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          item.itemType === "component"
                            ? "bg-[#dbeafe] text-[#1d4ed8]"
                            : "bg-[#e0f2fe] text-[#075985]"
                        }`}
                      >
                        {item.itemType}
                      </span>
                    </td>
                    <td>{item.quantity}</td>
                    <td>
                      <CurrencyText value={item.revenue} />
                    </td>
                    <td>
                      <CurrencyText value={item.profit} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DataPanel>
    </div>
  );
}
