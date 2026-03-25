import { useState } from "react";
import { Link } from "react-router-dom";

import { buildInboundTrackerRows } from "@/features/inbound/model/inboundMetrics";
import {
  DataPanel,
  EmptyPanel,
  InventoryPageHeader,
  SummaryCard,
} from "@/features/inventory/shared/InventoryScaffold";
import {
  useSupplierPurchaseOrderItems,
  useSupplierPurchaseOrders,
  useSuppliers,
} from "@/services/hooks/useDomainQueries";
import { formatDate, formatNok } from "@/shared/lib/format";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { StatusBadge } from "@/shared/ui/StatusBadge";

export function InboundTrackerPage() {
  const [todayTimestamp] = useState(() => Date.now());
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [supplierId, setSupplierId] = useState("");

  const suppliersQuery = useSuppliers();
  const purchaseOrdersQuery = useSupplierPurchaseOrders();
  const purchaseOrderItemsQuery = useSupplierPurchaseOrderItems();

  if (
    suppliersQuery.isLoading ||
    purchaseOrdersQuery.isLoading ||
    purchaseOrderItemsQuery.isLoading
  ) {
    return <LoadingState label="Loading inbound tracker..." />;
  }

  if (
    suppliersQuery.isError ||
    purchaseOrdersQuery.isError ||
    purchaseOrderItemsQuery.isError
  ) {
    return <ErrorState title="Could not load the inbound tracker." />;
  }

  const suppliers = suppliersQuery.data ?? [];
  const rows = buildInboundTrackerRows({
    purchaseOrders: purchaseOrdersQuery.data ?? [],
    purchaseOrderItems: purchaseOrderItemsQuery.data ?? [],
    suppliers,
  }).filter((row) => {
    const needle = query.trim().toLowerCase();
    if (
      needle &&
      ![row.poNumber, row.supplierName].join(" ").toLowerCase().includes(needle)
    ) {
      return false;
    }

    if (status && row.status !== status) {
      return false;
    }

    if (supplierId) {
      const supplier = suppliers.find((item) => item.id === supplierId);
      if (!supplier || supplier.name !== row.supplierName) {
        return false;
      }
    }

    return true;
  });

  const inboundDueSoon = rows.filter((row) => {
    if (!row.eta) return false;
    const eta = new Date(row.eta).getTime();
    const diffDays = Math.ceil((eta - todayTimestamp) / (1000 * 60 * 60 * 24));
    return diffDays <= 14;
  }).length;

  const openPos = rows.filter(
    (row) => row.status === "ordered" || row.status === "partially_received",
  ).length;
  const remainingUnits = rows.reduce((sum, row) => sum + row.remainingUnits, 0);
  const totalInboundValue = rows.reduce((sum, row) => sum + row.estimatedValue, 0);

  return (
    <div className="app-page">
      <InventoryPageHeader
        eyebrow="Inbound / Supplier purchase orders"
        title="Inbound tracker"
        description="Track supplier purchase orders, arrival ETA, and remaining quantities that feed Lovold order planning and promised delivery dates."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <SummaryCard label="Open POs" value={String(openPos)} />
        <SummaryCard label="Inbound due soon" value={String(inboundDueSoon)} tone="warning" />
        <SummaryCard label="Remaining inbound units" value={String(remainingUnits)} />
        <SummaryCard
          label="Open inbound value"
          value={formatNok(totalInboundValue)}
          tone="brand"
        />
      </div>

      <DataPanel
        title="Supplier PO filters"
        description="Search by PO number or supplier, then narrow the list by supplier and purchase-order status."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="app-label">Search</span>
            <input
              className="app-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="PO-2026-4004 or Arctic Sensors..."
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
              <option value="draft">Draft</option>
              <option value="ordered">Ordered</option>
              <option value="partially_received">Partially received</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="app-label">Supplier</span>
            <select
              className="app-select"
              value={supplierId}
              onChange={(event) => setSupplierId(event.target.value)}
            >
              <option value="">All suppliers</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </DataPanel>

      {rows.length === 0 ? (
        <EmptyPanel
          title="No supplier POs match these filters"
          copy="Try widening the search or clearing one of the active inbound filters."
        />
      ) : (
        <DataPanel
          title="Supplier PO register"
          description="All inbound orders that can affect component builds, product replenishment, and ETA commitments."
        >
          <div className="app-table-shell">
            <table className="app-table">
              <thead>
                <tr>
                  <th>PO</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th>Order date</th>
                  <th>ETA</th>
                  <th>Remaining</th>
                  <th>Value</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="space-y-1">
                        <div className="font-semibold text-[var(--text-primary)]">
                          {row.poNumber}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {row.lineCount} lines • {row.orderedUnits} ordered units
                        </div>
                      </div>
                    </td>
                    <td>{row.supplierName}</td>
                    <td>
                      <StatusBadge value={row.status} />
                    </td>
                    <td>{formatDate(row.orderDate)}</td>
                    <td>{row.eta ? formatDate(row.eta) : "TBD"}</td>
                    <td>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {row.remainingUnits}
                      </span>
                      <div className="text-xs text-[var(--text-muted)]">
                        {row.receivedUnits} received
                      </div>
                    </td>
                    <td>{formatNok(row.estimatedValue)}</td>
                    <td className="text-right">
                      <Link
                        className="text-sm font-semibold text-[var(--brand-900)] hover:underline"
                        to={`/inbound/${row.id}`}
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
