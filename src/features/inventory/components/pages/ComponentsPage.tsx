import { useState } from "react";
import { Link } from "react-router-dom";

import {
  useCategories,
  useComponentProducts,
  useComponents,
  useProducts,
} from "@/services/hooks/useDomainQueries";
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
        actions={
          <Link className="app-button-primary" to="/inventory/components/new">
            Create component
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <SummaryCard
          label="Active components"
          value={String(components.filter((component) => component.status === "active").length)}
          supporting="Composite sellable assemblies in the registry."
        />
        <SummaryCard
          label="Ready-made stock"
          value={String(totalReadyMade)}
          supporting="Finished component units currently on hand."
        />
        <SummaryCard
          label="Reserved assemblies"
          value={String(totalReserved)}
          supporting="Committed units already allocated to customer orders."
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
        />
      </div>

      <DataPanel
        title="Catalog filters"
        description="Search by component identity, then narrow the registry by category and status."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="app-label">Search</span>
            <input
              className="app-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Monitoring bundle, LOV-COMP..."
            />
          </label>
          <label className="space-y-2">
            <span className="app-label">Category</span>
            <select
              className="app-select"
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
          </label>
          <label className="space-y-2">
            <span className="app-label">Status</span>
            <select
              className="app-select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>
      </DataPanel>

      {components.length === 0 ? (
        <EmptyPanel
          title="No components match these filters"
          copy="Create a component assembly when Lovold needs a reusable bundle built from one or more base products."
          action={
            <Link className="app-button-secondary" to="/inventory/components/new">
              Add component
            </Link>
          }
        />
      ) : (
        <DataPanel
          title="Components"
          description="Composite sellable items with ready-made stock and a production-cost layer."
        >
          <div className="app-table-shell">
            <table className="app-table">
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
                      <td className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                        {component.sku}
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="font-medium text-[var(--text-primary)]">
                            {component.name}
                          </div>
                          <div className="text-xs text-[var(--text-secondary)]">
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
                        <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                          {rows.length} items
                        </span>
                      </td>
                      <td>
                        <StatusBadge value={component.status} />
                      </td>
                      <td className="text-right">
                        <Link
                          className="text-sm font-semibold text-[var(--brand-900)] hover:underline"
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
