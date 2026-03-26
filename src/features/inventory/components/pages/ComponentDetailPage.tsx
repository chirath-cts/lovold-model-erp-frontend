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
  const derivedPrice = getComponentDerivedBasePrice(component, compositionRows, products);
  const derivedCost = getComponentDerivedCost(component, compositionRows, products);

  return (
    <div className="app-page">
      <nav className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        <Link className="hover:text-[var(--brand-900)]" to="/inventory/components">
          Inventory
        </Link>
        <span>/</span>
        <Link className="hover:text-[var(--brand-900)]" to="/inventory/components">
          Components
        </Link>
        <span>/</span>
        <span className="text-[var(--brand-900)]">{component.sku}</span>
      </nav>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
        <section className="app-ops-card overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-100 p-5 md:p-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0 space-y-4">
                <div className="space-y-2">
                  <div className="app-ops-eyebrow">Component registry / detail</div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-4xl">
                    {component.name}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-sm bg-white px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 shadow-sm ring-1 ring-slate-200">
                    SKU: {component.sku}
                  </span>
                  <StatusBadge value={component.status} />
                  <span className="rounded-sm bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600 ring-1 ring-slate-200">
                    {compositionRows.length} BOM rows
                  </span>
                </div>
                <p className="max-w-3xl text-sm leading-6 text-slate-500">
                  {component.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link className="app-button-secondary-sharp" to="/inventory/components">
                  Back to components
                </Link>
                <Link
                  className="app-button-primary-sharp"
                  to={`/inventory/components/${component.id}/edit`}
                >
                  Edit component
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-4 md:p-6">
            <SummaryCard label="Stock on hand" value={String(component.stockQuantity)} variant="ops" />
            <SummaryCard label="Reserved" value={String(component.reservedQuantity)} variant="ops" />
            <SummaryCard
              label="Available"
              value={String(availableQuantity)}
              tone="brand"
              supporting="Ready-made stock still free for new orders."
              variant="ops"
            />
            <SummaryCard
              label="Standard production"
              value={new Intl.NumberFormat("nb-NO", {
                style: "currency",
                currency: "NOK",
                maximumFractionDigits: 0,
              }).format(component.standardProductionCost)}
              variant="ops"
            />
          </div>
        </section>

        <aside className="app-ops-card overflow-hidden p-4">
          <div className="overflow-hidden rounded-sm border border-slate-200 bg-slate-50">
            <div className="aspect-[4/3] bg-slate-50">
              {component.imageUrl ? (
                <img
                  className="h-full w-full object-cover"
                  src={component.imageUrl}
                  alt={component.name}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">
                  No component image
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
              Derived price
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-800">
              <CurrencyText value={derivedPrice} />
            </div>
            <div className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Derived cost
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-800">
              <CurrencyText value={derivedCost} />
            </div>
          </div>
        </aside>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
        <DataPanel title="Overview" description="Master data for the finished component assembly." variant="ops">
          <FieldGrid
            variant="ops"
            fields={[
              { label: "SKU", value: <span className="font-mono">{component.sku}</span> },
              { label: "Category", value: categoryName },
              { label: "Unit", value: component.unit },
              { label: "Status", value: <StatusBadge value={component.status} /> },
              {
                label: "Derived price",
                value: <CurrencyText value={derivedPrice} />,
              },
              {
                label: "Derived cost",
                value: <CurrencyText value={derivedCost} />,
              },
            ]}
          />
          <div className="app-ops-field-card rounded-sm p-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Description
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {component.description}
            </p>
          </div>
        </DataPanel>

        <DataPanel title="Inventory state" description="Ready-made stock and reservation pressure for the finished component." variant="ops">
          <FieldGrid
            variant="ops"
            fields={[
              { label: "Ready-made stock", value: `${component.stockQuantity} ${component.unit}` },
              { label: "Reserved quantity", value: `${component.reservedQuantity} ${component.unit}` },
              { label: "Available quantity", value: `${availableQuantity} ${component.unit}` },
              { label: "Component rows", value: `${compositionRows.length} BOM entries` },
            ]}
          />
        </DataPanel>
      </div>

      <section className="app-registry-table-block">
        <div className="app-registry-table-header">
          <div className="space-y-1">
            <h2 className="app-registry-table-header-title">Composition breakdown</h2>
            <p className="app-registry-table-header-copy">
              Underlying base products consumed when this component is built or backfilled from materials.
            </p>
          </div>
        </div>
        <div className="app-registry-table-scroll">
          <table className="app-registry-table">
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
                    <td className="font-mono text-xs uppercase tracking-[0.12em] text-slate-500">
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
      </section>
    </div>
  );
}
