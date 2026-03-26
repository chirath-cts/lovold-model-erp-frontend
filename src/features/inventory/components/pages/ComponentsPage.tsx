import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
  EmptyPanel,
  InventoryPageHeader,
  SummaryCard,
} from "@/features/inventory/shared/InventoryScaffold";
import {
  getAvailableQuantity,
  getComponentDerivedBasePrice,
} from "@/features/inventory/shared/catalogHelpers";

export function ComponentsPage() {
  const navigate = useNavigate();
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
        <section className="app-registry-table-block">
          <div className="app-registry-table-header">
            <div className="space-y-1">
              <h2 className="app-registry-table-header-title">Components</h2>
              <p className="app-registry-table-header-copy">
                Composite sellable items with ready-made stock, derived pricing,
                and a stored production-cost layer.
              </p>
            </div>
          </div>
          <div className="app-registry-table-scroll">
            <table className="app-registry-table app-registry-table-compact">
              <thead>
                <tr>
                  <th className="w-[120px]">SKU</th>
                  <th className="w-[30%]">Component</th>
                  <th className="w-[14%]">Category</th>
                  <th className="w-[12%] text-right">Derived price</th>
                  <th className="w-[12%] text-right">Standard production</th>
                  <th className="w-[7%] text-right">Available</th>
                  <th className="w-[8%] text-right">BOM rows</th>
                  <th className="w-[8%]">Status</th>
                  <th className="w-[52px] text-right" aria-label="Actions" />
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
                    <tr
                      key={component.id}
                      className="app-registry-table-row group cursor-pointer"
                      onClick={() => navigate(`/inventory/components/${component.id}`)}
                    >
                      <td className="text-xs font-mono font-bold text-slate-800">
                        {component.sku}
                      </td>
                      <td>
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-slate-200 bg-slate-50">
                            {component.imageUrl ? (
                              <img
                                className="h-full w-full object-cover"
                                src={component.imageUrl}
                                alt={component.name}
                              />
                            ) : (
                              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                CMP
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 max-w-[260px] space-y-1">
                            <div className="text-sm font-semibold leading-5 text-slate-800">
                              {component.name}
                            </div>
                            <div className="line-clamp-2 text-xs leading-5 text-slate-500">
                              {component.description}
                            </div>
                            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                              {component.unit}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[140px] text-sm leading-6 text-slate-600">
                        {categoryLookup.get(component.categoryId) ?? "Unassigned"}
                      </td>
                      <td className="text-right">
                        <CurrencyText
                          value={getComponentDerivedBasePrice(component, rows, products)}
                        />
                      </td>
                      <td className="text-right">
                        <CurrencyText value={component.standardProductionCost} />
                      </td>
                      <td className="text-right text-xs font-mono font-semibold text-emerald-600">
                        {available}
                      </td>
                      <td className="text-right">
                        <span className="rounded-sm bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600">
                          {rows.length} items
                        </span>
                      </td>
                      <td>
                        <StatusBadge value={component.status} />
                      </td>
                      <td className="text-right">
                        <Link
                          className="inline-flex rounded-sm p-1 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-700 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
                          to={`/inventory/components/${component.id}`}
                          aria-label={`View ${component.name}`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 5v14m0 0-7-7m7 7 7-7"
                            />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="app-registry-table-footer">
            <span className="app-registry-table-footer-label">
              Showing 1-{components.length} of {components.length} components
            </span>
            <div className="app-registry-table-pagination">
              <button className="app-registry-table-pagination-button" disabled>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="flex items-center gap-1">
                <span className="app-registry-table-pagination-current">1</span>
              </div>
              <button className="app-registry-table-pagination-button">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
