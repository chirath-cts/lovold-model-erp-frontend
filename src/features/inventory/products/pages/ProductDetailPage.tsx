import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { componentProductsService } from "@/services/endpoints/componentProductsService";
import { useCategories, useComponents, useProductById } from "@/services/hooks/useDomainQueries";
import { queryKeys } from "@/shared/constants/queryKeys";
import { CurrencyText } from "@/shared/ui/CurrencyText";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import type { Component } from "@/shared/types/domain";
import {
  DataPanel,
  FieldGrid,
} from "@/features/inventory/shared/InventoryScaffold";
import {
  getAvailableQuantity,
  getProductStockHealth,
} from "@/features/inventory/shared/catalogHelpers";

export function ProductDetailPage() {
  const { productId = "" } = useParams();
  const productQuery = useProductById(productId);
  const categoriesQuery = useCategories();
  const componentsQuery = useComponents();
  const componentRowsQuery = useQuery({
    queryKey: queryKeys.componentProducts,
    queryFn: () => componentProductsService.getList(),
  });

  if (
    productQuery.isLoading ||
    categoriesQuery.isLoading ||
    componentsQuery.isLoading ||
    componentRowsQuery.isLoading
  ) {
    return <LoadingState label="Loading product details..." />;
  }

  if (
    productQuery.isError ||
    categoriesQuery.isError ||
    componentsQuery.isError ||
    componentRowsQuery.isError ||
    !productQuery.data
  ) {
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
  const stockHealth = getProductStockHealth(product);
  const stockValue = product.stockQuantity * product.basePrice;
  const grossSpread = product.basePrice - product.purchasePrice;
  const marginPercent = product.basePrice > 0
    ? Math.round((grossSpread / product.basePrice) * 100)
    : 0;
  const linkedRows = (componentRowsQuery.data ?? []).filter(
    (row) => row.productId === product.id,
  );
  const linkedComponents = linkedRows
    .map((row) => {
      const component = componentsQuery.data?.find((candidate) => candidate.id === row.componentId);
      if (!component) return null;
      return { component, quantity: row.quantity };
    })
    .filter(Boolean) as Array<{ component: Component; quantity: number }>;

  return (
    <div className="app-page">
      <nav className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        <Link className="hover:text-[var(--brand-900)]" to="/inventory/products">
          Inventory
        </Link>
        <span>/</span>
        <Link className="hover:text-[var(--brand-900)]" to="/inventory/products">
          Products
        </Link>
        <span>/</span>
        <span className="text-[var(--brand-900)]">{product.sku}</span>
      </nav>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
        <section className="app-ops-card overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-100 p-5 md:p-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0 space-y-4">
                <div className="space-y-2">
                  <div className="app-ops-eyebrow">
                    Product registry / detail
                  </div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-4xl">
                    {product.name}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-sm bg-white px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 shadow-sm ring-1 ring-slate-200">
                    SKU: {product.sku}
                  </span>
                  <StatusBadge value={product.status} />
                  <StatusBadge value={stockHealth} />
                </div>
                <p className="max-w-3xl text-sm leading-6 text-slate-500">
                  {product.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link className="app-button-secondary-sharp" to="/inventory/products">
                  Back to products
                </Link>
                <Link
                  className="app-button-primary-sharp"
                  to={`/inventory/products/${product.id}/edit`}
                >
                  Edit product
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-3 md:p-6">
            <div className="app-ops-kpi-card border-l-4 border-[var(--brand-700)]">
              <div className="app-ops-kpi-label">
                Total stock
              </div>
              <div className="mt-3 text-4xl font-black tracking-tight text-slate-800">
                {product.stockQuantity}
                <span className="ml-2 text-sm font-semibold text-slate-500">
                  {product.unit}
                </span>
              </div>
            </div>
            <div className="app-ops-kpi-card app-ops-card-muted">
              <div className="app-ops-kpi-label">
                Reserved
              </div>
              <div className="mt-3 text-4xl font-black tracking-tight text-slate-800">
                {product.reservedQuantity}
                <span className="ml-2 text-sm font-semibold text-slate-500">
                  {product.unit}
                </span>
              </div>
            </div>
            <div className="app-ops-kpi-card border-[var(--brand-700)] bg-[var(--brand-900)] text-white">
              <div className="app-ops-kpi-label text-white/70">
                Available
              </div>
              <div className="mt-3 text-4xl font-black tracking-tight">
                {availableQuantity}
              </div>
              <div className="mt-2 text-sm font-medium text-white/80">
                Reservation-aware availability
              </div>
            </div>
          </div>
        </section>

        <aside className="app-ops-card overflow-hidden p-4">
          <div className="overflow-hidden rounded-sm border border-slate-200 bg-slate-50">
            <div className="aspect-[4/3] bg-slate-50">
              {product.imageUrl ? (
                <img
                  className="h-full w-full object-cover"
                  src={product.imageUrl}
                  alt={product.name}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">
                  No product image
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 rounded-sm border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Category
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-800">
              {categoryName}
            </div>
            <div className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Reorder threshold
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-800">
              {product.reorderLevel} {product.unit}
            </div>
          </div>
        </aside>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
        <div className="space-y-6">
          <DataPanel
            title="Overview"
            description="Commercial and operational context for this Lovold base product."
            variant="ops"
          >
            <FieldGrid
              variant="ops"
              fields={[
                { label: "SKU", value: <span className="font-mono">{product.sku}</span> },
                { label: "Category", value: categoryName },
                { label: "Unit", value: product.unit },
                { label: "Status", value: <StatusBadge value={product.status} /> },
              ]}
            />
            <div className="app-ops-field-card rounded-sm p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Description
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {product.description}
              </p>
            </div>
          </DataPanel>

          <DataPanel
            title="Linked components"
            description="Ready-made components that consume this product in their bill of materials."
            variant="ops"
          >
            {linkedComponents.length === 0 ? (
              <div className="rounded-sm border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                This product is not currently linked to any component assemblies.
              </div>
            ) : (
              <div className="space-y-3">
                {linkedComponents.map(({ component, quantity }) => (
                  <div
                    key={component.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800">
                        {component.name}
                      </div>
                      <div className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-slate-500">
                        {component.sku}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-sm bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600 ring-1 ring-slate-200">
                        Qty per assembly: {quantity}
                      </span>
                      <Link
                        className="app-button-ghost-sharp px-2 py-1 text-xs text-[var(--brand-900)]"
                        to={`/inventory/components/${component.id}`}
                      >
                        View component
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DataPanel>
        </div>

        <div className="space-y-6">
          <DataPanel
            title="Pricing and logistics"
            description="List pricing, purchase cost, and commercial spread for the product ledger."
            variant="ops"
          >
            <div className="space-y-4">
              <div className="rounded-sm border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Base list price
                    </div>
                    <div className="mt-3 text-3xl font-black tracking-tight text-slate-800">
                      <CurrencyText value={product.basePrice} />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Gross margin
                    </div>
                    <div className="mt-3 text-xl font-bold text-[var(--brand-900)]">
                      {marginPercent}%
                    </div>
                  </div>
                </div>
              </div>
              <FieldGrid
                variant="ops"
                fields={[
                  { label: "Purchase price", value: <CurrencyText value={product.purchasePrice} /> },
                  { label: "Gross spread", value: <CurrencyText value={grossSpread} /> },
                  { label: "Estimated stock value", value: <CurrencyText value={stockValue} /> },
                  { label: "Available value", value: <CurrencyText value={availableQuantity * product.basePrice} /> },
                ]}
              />
            </div>
          </DataPanel>

          <DataPanel
            title="Inventory state"
            description="Current stock position, reservation pressure, and reorder readiness."
            variant="ops"
          >
            <div className="space-y-4">
              <div className="rounded-sm border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Stock health
                    </div>
                    <div className="mt-3">
                      <StatusBadge value={stockHealth} />
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    Reorder trigger at {product.reorderLevel} {product.unit}
                  </div>
                </div>
              </div>
              <FieldGrid
                variant="ops"
                fields={[
                  { label: "Stock quantity", value: `${product.stockQuantity} ${product.unit}` },
                  { label: "Reserved quantity", value: `${product.reservedQuantity} ${product.unit}` },
                  { label: "Available quantity", value: `${availableQuantity} ${product.unit}` },
                  {
                    label: "Reservation coverage",
                    value: `${product.stockQuantity > 0 ? Math.round((product.reservedQuantity / product.stockQuantity) * 100) : 0}%`,
                  },
                ]}
              />
            </div>
          </DataPanel>
        </div>
      </div>
    </div>
  );
}
