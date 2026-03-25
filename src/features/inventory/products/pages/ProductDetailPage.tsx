import { Link, useParams } from "react-router-dom";

import { useCategories, useProductById } from "@/services/hooks/useDomainQueries";
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
  getProductStockHealth,
} from "@/features/inventory/shared/catalogHelpers";

export function ProductDetailPage() {
  const { productId = "" } = useParams();
  const productQuery = useProductById(productId);
  const categoriesQuery = useCategories();

  if (productQuery.isLoading || categoriesQuery.isLoading) {
    return <LoadingState label="Loading product details..." />;
  }

  if (productQuery.isError || categoriesQuery.isError || !productQuery.data) {
    return <ErrorState title="Could not load this product." />;
  }

  const product = productQuery.data;
  const categoryName =
    categoriesQuery.data?.find((category) => category.id === product.categoryId)?.name ??
    "Unassigned";
  const availableQuantity = getAvailableQuantity(
    product.stockQuantity,
    product.reservedQuantity,
  );

  return (
    <div className="app-page">
      <InventoryPageHeader
        eyebrow="Inventory / Products"
        title={product.name}
        description="Base product detail view for Lovold inventory, sell-side pricing, and reservation-aware availability."
        actions={
          <>
            <Link className="app-button-secondary" to="/inventory/products">
              Back to products
            </Link>
            <Link
              className="app-button-primary"
              to={`/inventory/products/${product.id}/edit`}
            >
              Edit product
            </Link>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <SummaryCard label="Stock on hand" value={String(product.stockQuantity)} />
        <SummaryCard label="Reserved" value={String(product.reservedQuantity)} />
        <SummaryCard
          label="Available"
          value={String(availableQuantity)}
          tone="brand"
          supporting="Availability already excludes reserved units."
        />
        <SummaryCard
          label="Health"
          value={getProductStockHealth(product)}
          tone={getProductStockHealth(product) === "critical" ? "warning" : "default"}
          supporting={`Reorder level: ${product.reorderLevel} ${product.unit}`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
        <DataPanel title="Overview" description="Commercial and operational context for this base product.">
          <FieldGrid
            fields={[
              { label: "SKU", value: <span className="font-mono">{product.sku}</span> },
              { label: "Category", value: categoryName },
              { label: "Unit", value: product.unit },
              { label: "Status", value: <StatusBadge value={product.status} /> },
              { label: "Base price", value: <CurrencyText value={product.basePrice} /> },
              { label: "Purchase price", value: <CurrencyText value={product.purchasePrice} /> },
            ]}
          />
          <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Description
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {product.description}
            </p>
          </div>
        </DataPanel>

        <DataPanel title="Inventory state" description="Current stock position and reorder pressure.">
          <div className="space-y-4">
            <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Stock health
              </div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <StatusBadge value={getProductStockHealth(product)} />
                <span className="text-sm text-[var(--text-secondary)]">
                  Reorder threshold: {product.reorderLevel} {product.unit}
                </span>
              </div>
            </div>
            <FieldGrid
              fields={[
                { label: "Stock quantity", value: `${product.stockQuantity} ${product.unit}` },
                { label: "Reserved quantity", value: `${product.reservedQuantity} ${product.unit}` },
                { label: "Available quantity", value: `${availableQuantity} ${product.unit}` },
                {
                  label: "Estimated stock value",
                  value: (
                    <CurrencyText value={product.stockQuantity * product.basePrice} />
                  ),
                },
              ]}
            />
          </div>
        </DataPanel>
      </div>
    </div>
  );
}
