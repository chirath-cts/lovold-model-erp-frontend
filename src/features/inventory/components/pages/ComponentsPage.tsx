import { useState } from "react";
import { Link } from "react-router-dom";

import {
  useCategories,
  useComponentProducts,
  useComponents,
  useProducts,
} from "@/services/hooks/useDomainQueries";
import { SearchIcon } from "@/shared/ui/icons";
import { CurrencyText } from "@/shared/ui/CurrencyText";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import {
  DataPanel,
  EmptyPanel,
  InventoryPageHeader,
  SummaryCard,
} from "@/features/inventory/shared/InventoryScaffold";
import {
  getAvailableQuantity,
  getComponentDerivedBasePrice,
} from "@/features/inventory/shared/catalogHelpers";

export function ComponentsPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");

  const componentsQuery = useComponents({
    nameLike: search || undefined,
    categoryId: categoryId || undefined,
    status: (status || undefined) as "active" | "inactive" | undefined,
  });
  const categoriesQuery = useCategories();
  const productsQuery = useProducts();
  const componentProductsQuery = useComponentProducts();

  if (
    componentsQuery.isLoading ||
    categoriesQuery.isLoading ||
    productsQuery.isLoading ||
    componentProductsQuery.isLoading
  ) {
    return <LoadingState label="Loading component registry..." />;
  }

  if (
    componentsQuery.isError ||
    categoriesQuery.isError ||
    productsQuery.isError ||
    componentProductsQuery.isError
  ) {
    return <ErrorState title="Could not load component registry." />;
  }

  const components = componentsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const componentProducts = componentProductsQuery.data ?? [];
  const categoryLookup = new Map(categories.map((category) => [category.id, category.name]));

  const totalReadyMade = components.reduce(
    (sum, component) => sum + component.stockQuantity,
    0,
  );
  const totalReserved = components.reduce(
    (sum, component) => sum + component.reservedQuantity,
    0,
  );
  const standardProductionTotal = components.reduce(
    (sum, component) => sum + component.standardProductionCost,
    0,
  );

  return (
    <div className="app-page">
      <InventoryPageHeader
        eyebrow="Inventory / Components"
        title="Components Registry"
        description="Manage ready-made component assemblies, standard production cost, and composition across Lovold aquaculture solutions."
        variant="ops"
        actions={
          <Link className="app-button-primary-sharp" to="/inventory/components/new">
            Create component
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <SummaryCard
          label="Active components"
          value={String(components.filter((component) => component.status === "active").length)}
          supporting="Composite sellable assemblies in the registry."
          variant="ops"
        />
        <SummaryCard
          label="Ready-made stock"
          value={String(totalReadyMade)}
          supporting="Finished component units currently on hand."
          variant="ops"
        />
        <SummaryCard
          label="Reserved assemblies"
          value={String(totalReserved)}
          supporting="Committed units already allocated to customer orders."
          variant="ops"
        />
        <SummaryCard
          label="Standard production cost"
          value={new Intl.NumberFormat("nb-NO", {
            style: "currency",
            currency: "NOK",
            maximumFractionDigits: 0,
          }).format(standardProductionTotal)}
          tone="brand"
          supporting="Stored fixed production layer across all components."
          variant="ops"
        />
      </div>

      <section className="app-ops-toolbar space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-800">
              Catalog filters
            </h2>
            <p className="text-sm text-slate-500">
              Search by component identity, then narrow the registry by category and status.
            </p>
          </div>
          <div className="rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600 shadow-sm">
            Active filters: {[search.trim(), categoryId, status].filter(Boolean).length}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="app-label">Search</span>
            <div className="app-ops-control">
              <SearchIcon className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                className="app-input-sharp min-w-0 flex-1 bg-transparent px-0 py-0 shadow-none ring-0 focus:ring-0"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Monitoring bundle, LOV-COMP..."
              />
            </div>
          </label>
          <label className="space-y-2">
            <span className="app-label">Category</span>
            <div className="app-ops-control">
              <select
                className="app-select-sharp bg-transparent px-0 py-0 shadow-none ring-0 focus:ring-0"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </label>
          <label className="space-y-2">
            <span className="app-label">Status</span>
            <div className="app-ops-control">
              <select
                className="app-select-sharp bg-transparent px-0 py-0 shadow-none ring-0 focus:ring-0"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </label>
        </div>
      </section>

      {components.length === 0 ? (
        <EmptyPanel
          title="No components match these filters"
          copy="Create a component assembly when Lovold needs a reusable bundle built from one or more base products."
          variant="ops"
          action={
            <Link className="app-button-secondary-sharp" to="/inventory/components/new">
              Add component
            </Link>
          }
        />
      ) : (
        <DataPanel
          title="Components"
          description="Composite sellable items with ready-made stock and a production-cost layer."
          variant="ops"
        >
          <div className="app-ops-table-shell overflow-x-auto">
            <table className="app-ops-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Component</th>
                  <th>Category</th>
                  <th>Derived price</th>
                  <th>Standard production</th>
                  <th>Available</th>
                  <th>BOM rows</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {components.map((component) => {
                  const rows = componentProducts.filter(
                    (row) => row.componentId === component.id,
                  );
                  const available = getAvailableQuantity(
                    component.stockQuantity,
                    component.reservedQuantity,
                  );

                  return (
                    <tr key={component.id}>
                      <td className="font-mono text-xs uppercase tracking-[0.12em] text-slate-500">
                        {component.sku}
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="font-medium text-slate-800">
                            {component.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {component.description}
                          </div>
                        </div>
                      </td>
                      <td>{categoryLookup.get(component.categoryId) ?? "Unassigned"}</td>
                      <td>
                        <CurrencyText
                          value={getComponentDerivedBasePrice(component, rows, products)}
                        />
                      </td>
                      <td>
                        <CurrencyText value={component.standardProductionCost} />
                      </td>
                      <td className="font-semibold text-[var(--brand-900)]">{available}</td>
                      <td>
                        <span className="rounded-sm bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {rows.length} items
                        </span>
                      </td>
                      <td>
                        <StatusBadge value={component.status} />
                      </td>
                      <td className="text-right">
                        <Link
                          className="app-button-ghost-sharp px-2 py-1 text-xs text-[var(--brand-900)]"
                          to={`/inventory/components/${component.id}`}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DataPanel>
      )}
    </div>
  );
}
