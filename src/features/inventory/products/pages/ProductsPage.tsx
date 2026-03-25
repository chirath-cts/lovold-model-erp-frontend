import { useState } from "react";
import { Link } from "react-router-dom";

import { useCategories, useProducts } from "@/services/hooks/useDomainQueries";
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
  getProductStockHealth,
} from "@/features/inventory/shared/catalogHelpers";

export function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");

  const productsQuery = useProducts({
    nameLike: search || undefined,
    categoryId: categoryId || undefined,
    status: (status || undefined) as "active" | "inactive" | undefined,
  });
  const categoriesQuery = useCategories();

  if (productsQuery.isLoading || categoriesQuery.isLoading) {
    return <LoadingState label="Loading product registry..." />;
  }

  if (productsQuery.isError || categoriesQuery.isError) {
    return <ErrorState title="Could not load product registry." />;
  }

  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const categoryLookup = new Map(categories.map((category) => [category.id, category.name]));

  const totalAssetValue = products.reduce(
    (sum, product) => sum + product.stockQuantity * product.basePrice,
    0,
  );
  const totalReserved = products.reduce(
    (sum, product) => sum + product.reservedQuantity,
    0,
  );
  const criticalCount = products.filter(
    (product) => getProductStockHealth(product) === "critical",
  ).length;

  return (
    <div className="app-page">
      <InventoryPageHeader
        eyebrow="Inventory / Products"
        title="Products Registry"
        description="Manage Lovold base products, live stock, reserved quantities, and reorder pressure for the aquaculture catalog."
        actions={
          <Link className="app-button-primary" to="/inventory/products/new">
            Create product
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <SummaryCard
          label="Active products"
          value={String(products.filter((product) => product.status === "active").length)}
          supporting="Base sellable items in the current registry."
        />
        <SummaryCard
          label="Reserved units"
          value={String(totalReserved)}
          supporting="Units already committed to customer orders."
        />
        <SummaryCard
          label="Critical availability"
          value={String(criticalCount)}
          tone="warning"
          supporting="Products at or below reorder threshold."
        />
        <SummaryCard
          label="Stock value"
          value={new Intl.NumberFormat("nb-NO", {
            style: "currency",
            currency: "NOK",
            maximumFractionDigits: 0,
          }).format(totalAssetValue)}
          tone="brand"
          supporting="Estimated list-price value across current stock."
        />
      </div>

      <DataPanel
        title="Catalog filters"
        description="Search by SKU, name, or description, then narrow the registry by category and lifecycle status."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="app-label">Search</span>
            <input
              className="app-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Feed blower, LOV-FEED..."
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

      {products.length === 0 ? (
        <EmptyPanel
          title="No products match these filters"
          copy="Try a broader search or create a new product entry to start the catalog."
          action={
            <Link className="app-button-secondary" to="/inventory/products/new">
              Add product
            </Link>
          }
        />
      ) : (
        <DataPanel
          title="Products"
          description="Base inventory items that can be sold directly or consumed inside components."
        >
          <div className="app-table-shell">
            <table className="app-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Base price</th>
                  <th>Stock</th>
                  <th>Reserved</th>
                  <th>Available</th>
                  <th>Health</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const available = getAvailableQuantity(
                    product.stockQuantity,
                    product.reservedQuantity,
                  );

                  return (
                    <tr key={product.id}>
                      <td className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                        {product.sku}
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="font-medium text-[var(--text-primary)]">
                            {product.name}
                          </div>
                          <div className="text-xs text-[var(--text-secondary)]">
                            {product.description}
                          </div>
                        </div>
                      </td>
                      <td>{categoryLookup.get(product.categoryId) ?? "Unassigned"}</td>
                      <td>
                        <CurrencyText value={product.basePrice} />
                      </td>
                      <td>{product.stockQuantity}</td>
                      <td>{product.reservedQuantity}</td>
                      <td className="font-semibold text-[var(--brand-900)]">{available}</td>
                      <td>
                        <StatusBadge value={getProductStockHealth(product)} />
                      </td>
                      <td className="text-right">
                        <Link
                          className="text-sm font-semibold text-[var(--brand-900)] hover:underline"
                          to={`/inventory/products/${product.id}`}
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
