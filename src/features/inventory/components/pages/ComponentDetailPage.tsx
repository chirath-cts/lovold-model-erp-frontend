import { Link, useParams } from "react-router-dom";

import {
  useCategories,
  useComponentById,
  useComponentProducts,
  useProducts,
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
  getAvailableQuantity,
  getComponentDerivedBasePrice,
  getComponentDerivedCost,
} from "@/features/inventory/shared/catalogHelpers";

export function ComponentDetailPage() {
  const { componentId = "" } = useParams();
  const componentQuery = useComponentById(componentId);
  const categoriesQuery = useCategories();
  const componentProductsQuery = useComponentProducts(componentId);
  const productsQuery = useProducts();

  if (
    componentQuery.isLoading ||
    categoriesQuery.isLoading ||
    componentProductsQuery.isLoading ||
    productsQuery.isLoading
  ) {
    return <LoadingState label="Loading component details..." />;
  }

  if (
    componentQuery.isError ||
    categoriesQuery.isError ||
    componentProductsQuery.isError ||
    productsQuery.isError ||
    !componentQuery.data
  ) {
    return <ErrorState title="Could not load this component." />;
  }

  const component = componentQuery.data;
  const compositionRows = componentProductsQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const productLookup = new Map(products.map((product) => [product.id, product]));
  const categoryName =
    categoriesQuery.data?.find((category) => category.id === component.categoryId)?.name ??
    "Unassigned";
  const availableQuantity = getAvailableQuantity(
    component.stockQuantity,
    component.reservedQuantity,
  );

  return (
    <div className="app-page">
      <InventoryPageHeader
        eyebrow="Inventory / Components"
        title={component.name}
        description="Composite component detail view with ready-made stock, production-cost visibility, and a full underlying product breakdown."
        actions={
          <>
            <Link className="app-button-secondary" to="/inventory/components">
              Back to components
            </Link>
            <Link
              className="app-button-primary"
              to={`/inventory/components/${component.id}/edit`}
            >
              Edit component
            </Link>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <SummaryCard label="Stock on hand" value={String(component.stockQuantity)} />
        <SummaryCard label="Reserved" value={String(component.reservedQuantity)} />
        <SummaryCard
          label="Available"
          value={String(availableQuantity)}
          tone="brand"
          supporting="Ready-made stock still free for new orders."
        />
        <SummaryCard
          label="Standard production"
          value={new Intl.NumberFormat("nb-NO", {
            style: "currency",
            currency: "NOK",
            maximumFractionDigits: 0,
          }).format(component.standardProductionCost)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.9fr)]">
        <DataPanel title="Overview" description="Master data for the finished component assembly.">
          <FieldGrid
            fields={[
              { label: "SKU", value: <span className="font-mono">{component.sku}</span> },
              { label: "Category", value: categoryName },
              { label: "Unit", value: component.unit },
              { label: "Status", value: <StatusBadge value={component.status} /> },
              {
                label: "Derived price",
                value: (
                  <CurrencyText
                    value={getComponentDerivedBasePrice(component, compositionRows, products)}
                  />
                ),
              },
              {
                label: "Derived cost",
                value: (
                  <CurrencyText
                    value={getComponentDerivedCost(component, compositionRows, products)}
                  />
                ),
              },
            ]}
          />
          <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Description
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {component.description}
            </p>
          </div>
        </DataPanel>

        <DataPanel title="Inventory state" description="Ready-made stock and reservation pressure for the finished component.">
          <FieldGrid
            fields={[
              { label: "Ready-made stock", value: `${component.stockQuantity} ${component.unit}` },
              { label: "Reserved quantity", value: `${component.reservedQuantity} ${component.unit}` },
              { label: "Available quantity", value: `${availableQuantity} ${component.unit}` },
              { label: "Component rows", value: `${compositionRows.length} BOM entries` },
            ]}
          />
        </DataPanel>
      </div>

      <DataPanel title="Composition breakdown" description="Underlying base products consumed when this component is built or backfilled from materials.">
        <div className="app-table-shell">
          <table className="app-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Quantity per unit</th>
                <th>Base price</th>
                <th>Purchase price</th>
              </tr>
            </thead>
            <tbody>
              {compositionRows.map((row) => {
                const product = productLookup.get(row.productId);

                return (
                  <tr key={row.id}>
                    <td>{product?.name ?? "Unknown product"}</td>
                    <td className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                      {product?.sku ?? row.productId}
                    </td>
                    <td>{row.quantity}</td>
                    <td>{product ? <CurrencyText value={product.basePrice} /> : "-"}</td>
                    <td>{product ? <CurrencyText value={product.purchasePrice} /> : "-"}</td>
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
