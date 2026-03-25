import { Link, useParams } from "react-router-dom";

import { buildSupplierPurchaseOrderDetailView } from "@/features/inbound/model/inboundMetrics";
import {
  DataPanel,
  FieldGrid,
  InventoryPageHeader,
  SummaryCard,
} from "@/features/inventory/shared/InventoryScaffold";
import {
  useProducts,
  useSupplierById,
  useSupplierPurchaseOrderById,
  useSupplierPurchaseOrderItems,
} from "@/services/hooks/useDomainQueries";
import { formatDate, formatNok } from "@/shared/lib/format";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { StatusBadge } from "@/shared/ui/StatusBadge";

export function SupplierPurchaseOrderDetailPage() {
  const { purchaseOrderId = "" } = useParams();

  const purchaseOrderQuery = useSupplierPurchaseOrderById(purchaseOrderId);
  const itemsQuery = useSupplierPurchaseOrderItems(purchaseOrderId);
  const productsQuery = useProducts();
  const supplierQuery = useSupplierById(purchaseOrderQuery.data?.supplierId);

  if (
    purchaseOrderQuery.isLoading ||
    itemsQuery.isLoading ||
    productsQuery.isLoading ||
    (purchaseOrderQuery.data?.supplierId ? supplierQuery.isLoading : false)
  ) {
    return <LoadingState label="Loading supplier PO detail..." />;
  }

  if (
    purchaseOrderQuery.isError ||
    itemsQuery.isError ||
    productsQuery.isError ||
    supplierQuery.isError
  ) {
    return <ErrorState title="Could not load the supplier PO." />;
  }

  const purchaseOrder = purchaseOrderQuery.data;
  if (!purchaseOrder) {
    return <ErrorState title="Supplier purchase order not found." />;
  }

  const items = itemsQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const supplier = supplierQuery.data;
  const summary = buildSupplierPurchaseOrderDetailView({ items, products });
  const productLookup = new Map(products.map((product) => [product.id, product]));

  return (
    <div className="app-page">
      <InventoryPageHeader
        eyebrow="Inbound / Supplier purchase order"
        title={purchaseOrder.poNumber}
        description="Detailed inbound visibility for the supplier purchase order driving material availability and customer ETA commitments."
        actions={
          <Link className="app-button-secondary" to="/inbound">
            Back to inbound tracker
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <SummaryCard label="Ordered units" value={String(summary.orderedUnits)} />
        <SummaryCard label="Received units" value={String(summary.receivedUnits)} />
        <SummaryCard
          label="Remaining units"
          value={String(summary.remainingUnits)}
          tone={summary.remainingUnits > 0 ? "warning" : "default"}
        />
        <SummaryCard
          label="Estimated PO value"
          value={formatNok(summary.estimatedValue)}
          tone="brand"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <DataPanel
          title="Purchase order overview"
          description="Header-level inbound data used by the planning workflow and the ETA engine."
        >
          <FieldGrid
            fields={[
              { label: "Status", value: <StatusBadge value={purchaseOrder.status} /> },
              { label: "Order date", value: formatDate(purchaseOrder.orderDate) },
              { label: "Arrival ETA", value: purchaseOrder.eta ? formatDate(purchaseOrder.eta) : "TBD" },
              { label: "Supplier", value: supplier?.name ?? "Unknown supplier" },
              { label: "Supplier email", value: supplier?.email ?? "Not available" },
              { label: "Supplier phone", value: supplier?.phone ?? "Not available" },
            ]}
          />

          {purchaseOrder.notes ? (
            <div className="mt-5 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 text-sm text-[var(--text-secondary)]">
              {purchaseOrder.notes}
            </div>
          ) : null}
        </DataPanel>

        <DataPanel
          title="Supplier contact and inbound signal"
          description="Commercial partner details together with the current receipt signal."
        >
          <FieldGrid
            fields={[
              { label: "Address", value: supplier?.address ?? "Not available" },
              { label: "Supplier status", value: supplier ? <StatusBadge value={supplier.status} /> : "Unknown" },
              { label: "Line count", value: items.length },
              { label: "Receipt progress", value: `${summary.receivedUnits} / ${summary.orderedUnits}` },
            ]}
          />
        </DataPanel>
      </div>

      <DataPanel
        title="Inbound lines"
        description="Products only. Remaining quantity here is what the order ETA engine can still count as incoming supply."
      >
        <div className="app-table-shell">
          <table className="app-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Ordered</th>
                <th>Received</th>
                <th>Remaining</th>
                <th>Unit cost</th>
                <th>Line value</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const product = productLookup.get(item.productId);
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="space-y-1">
                        <div className="font-semibold text-[var(--text-primary)]">
                          {product?.name ?? "Unknown product"}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {product?.unit ?? "unit"} • {product?.status ?? "unknown"}
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                      {product?.sku ?? "Unknown"}
                    </td>
                    <td>{item.orderedQuantity}</td>
                    <td>{item.receivedQuantity}</td>
                    <td>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {item.remainingQuantity}
                      </span>
                    </td>
                    <td>{formatNok(item.unitCost)}</td>
                    <td>{formatNok(item.orderedQuantity * item.unitCost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DataPanel>
    </div>
  );
}
