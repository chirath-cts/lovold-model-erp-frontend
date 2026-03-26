import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCategories, useProducts } from "@/services/hooks/useDomainQueries";
import { SearchIcon } from "@/shared/ui/icons";
import { CurrencyText } from "@/shared/ui/CurrencyText";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import {
  EmptyPanel,
  InventoryPageHeader,
} from "@/features/inventory/shared/InventoryScaffold";
import {
  getAvailableQuantity,
  getProductStockHealth,
} from "@/features/inventory/shared/catalogHelpers";

const compactNumber = new Intl.NumberFormat("en-US");

export function ProductsPage() {
  const navigate = useNavigate();
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
  const totalStock = products.reduce((sum, product) => sum + product.stockQuantity, 0);
  const totalReserved = products.reduce(
    (sum, product) => sum + product.reservedQuantity,
    0,
  );
  const totalAvailable = products.reduce(
    (sum, product) =>
      sum + getAvailableQuantity(product.stockQuantity, product.reservedQuantity),
    0,
  );
  const criticalCount = products.filter(
    (product) => getProductStockHealth(product) === "critical",
  ).length;
  const reservationRate = totalStock > 0 ? Math.round((totalReserved / totalStock) * 100) : 0;
  const activeFilters = [search.trim(), categoryId, status].filter(Boolean).length;

  return (
    <div className="app-page">
      <InventoryPageHeader
        eyebrow="Inventory / Products"
        title="Products Registry"
        description="Manage Lovold base products, live stock, reserved quantities, and reorder pressure for the aquaculture catalog."
        variant="ops"
        actions={
          <Link className="app-button-primary-sharp" to="/inventory/products/new">
            Create product
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-12">
        <section className="app-ops-card min-w-0 border-l-4 border-l-[var(--brand-700)] p-4 xl:col-span-4">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--brand-700)]/70">
            Metric ID: Stock Total
          </p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="text-4xl font-black tracking-tight text-[var(--text-primary)]">
                {compactNumber.format(totalStock)}
              </div>
              <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                Total product stock across the Lovold base-product registry.
              </p>
            </div>
            <div className="rounded-sm bg-[var(--brand-100)] px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-900)]">
              {compactNumber.format(products.length)} SKUs
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-600" />
            Available: {compactNumber.format(totalAvailable)} units
          </div>
        </section>

        <section className="app-ops-card app-ops-card-muted min-w-0 p-4 xl:col-span-4">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Metric ID: Rsv Volume
          </p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="text-4xl font-black tracking-tight text-[var(--text-primary)]">
                {compactNumber.format(totalReserved)}
              </div>
              <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                Reserved units already committed to customer projects.
              </p>
            </div>
            <div className="rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
              {reservationRate}% rate
            </div>
          </div>
          <div className="mt-5">
            <div className="h-2 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-[var(--brand-700)]"
                style={{ width: `${Math.min(reservationRate, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Reservation-aware stock coverage
            </p>
          </div>
        </section>

        <section className="app-ops-kpi-card min-w-0 border-amber-300 bg-amber-50 xl:col-span-2">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-800">
            Critical alert
          </p>
          <div className="mt-3 text-4xl font-black tracking-tight text-amber-950">
            {compactNumber.format(criticalCount)}
          </div>
          <p className="mt-1 text-sm font-medium text-amber-900/80">
            Products currently at or below reorder pressure.
          </p>
          <div className="mt-5 rounded-sm bg-white/80 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-800">
            Review procurement exposure
          </div>
        </section>

        <section className="app-ops-kpi-card min-w-0 border-[var(--brand-700)] bg-[var(--brand-900)] text-white xl:col-span-2">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">
            Inventory value
          </p>
          <div className="mt-3 text-2xl font-black tracking-tight md:text-[1.75rem]">
            <span className="break-words">{compactNumber.format(totalAssetValue)}</span>{" "}
            <span className="whitespace-nowrap text-[0.8em]">kr</span>
          </div>
          <p className="mt-2 text-sm font-medium text-white/80">
            Estimated list-price value of stocked product inventory.
          </p>
        </section>
      </div>

      <section className="app-ops-toolbar space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-800">
              Catalog filters
            </h2>
            <p className="text-sm text-slate-500">
              Filter by Lovold SKU, product name, category, or lifecycle status.
            </p>
          </div>
          <div className="rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600 shadow-sm">
            Active filters: {activeFilters}
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_220px_220px]">
          <label className="space-y-2">
            <span className="app-label">Filter by name or SKU</span>
            <div className="app-ops-control relative">
              <SearchIcon className="pointer-events-none h-4 w-4 shrink-0 text-slate-400" />
              <input
                className="app-input-sharp min-w-0 flex-1 bg-transparent px-0 py-0 shadow-none ring-0 focus:ring-0"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Feed blower, LOV-FEED..."
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
            <span className="app-label">Lifecycle status</span>
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

      {products.length === 0 ? (
        <EmptyPanel
          title="No products match these filters"
          copy="Try a broader search or create a new product entry to start the catalog."
          variant="ops"
          action={
            <Link className="app-button-secondary-sharp" to="/inventory/products/new">
              Add product
            </Link>
          }
        />
      ) : (
        <section className="app-registry-table-block">
          <div className="app-registry-table-header">
            <div className="space-y-1">
              <h2 className="app-registry-table-header-title">Products</h2>
              <p className="app-registry-table-header-copy">
                Base inventory items that can be sold directly or consumed inside
                components.
              </p>
            </div>
          </div>
          <div className="app-registry-table-scroll">
            <table className="app-registry-table app-registry-table-compact w-full">
              <thead>
                <tr>
                  <th className="w-[96px]">SKU</th>
                  <th className="w-[30%]">Product</th>
                  <th className="w-[14%]">Category</th>
                  <th className="w-[12%] text-right">Base price</th>
                  <th className="w-[6%] text-right">Stock</th>
                  <th className="w-[7%] text-right">Reserved</th>
                  <th className="w-[7%] text-right">Available</th>
                  <th className="w-[8%]">Health</th>
                  <th className="w-[8%]">Status</th>
                  <th className="w-[52px] text-right" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const available = getAvailableQuantity(
                    product.stockQuantity,
                    product.reservedQuantity,
                  );
                  const health = getProductStockHealth(product);

                  return (
                    <tr
                      key={product.id}
                      className="app-registry-table-row group cursor-pointer"
                      onClick={() => navigate(`/inventory/products/${product.id}`)}
                    >
                      <td className="text-xs font-mono font-bold text-slate-800">
                        {product.sku}
                      </td>
                      <td>
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-slate-200 bg-slate-50">
                            {product.imageUrl ? (
                              <img
                                className="h-full w-full object-cover"
                                src={product.imageUrl}
                                alt={product.name}
                              />
                            ) : (
                              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                                N/A
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 max-w-[240px] space-y-1">
                            <div className="text-sm font-semibold leading-5 text-slate-800">
                              {product.name}
                            </div>
                            <div className="line-clamp-2 text-xs leading-5 text-slate-500">
                              {product.description}
                            </div>
                            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                              {product.unit}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[140px] text-sm leading-6 text-slate-600">
                        {categoryLookup.get(product.categoryId) ?? "Unassigned"}
                      </td>
                      <td className="text-right">
                        <div className="space-y-1 whitespace-nowrap">
                          <div className="text-xs font-mono font-bold text-slate-800">
                            <CurrencyText value={product.basePrice} />
                          </div>
                          <div className="text-xs text-slate-500">
                            Buy <CurrencyText value={product.purchasePrice} />
                          </div>
                        </div>
                      </td>
                      <td className="text-right text-xs font-mono font-bold text-slate-800">
                        {product.stockQuantity}
                      </td>
                      <td className="text-right text-xs font-medium text-slate-600">
                        {product.reservedQuantity}
                      </td>
                      <td className="text-right text-xs font-mono font-semibold text-emerald-600">
                        {available}
                      </td>
                      <td>
                        <StatusBadge value={health} />
                      </td>
                      <td>
                        <StatusBadge value={product.status} />
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1 opacity-100 transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                          <Link
                            className="inline-flex rounded-sm p-1 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-700 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
                            to={`/inventory/products/${product.id}/edit`}
                            aria-label={`Edit ${product.name}`}
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
                                d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L12 15l-4 1 1-4 8.586-8.586Z"
                              />
                            </svg>
                          </Link>
                          <Link
                            className="inline-flex rounded-sm p-1 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-700 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
                            to={`/inventory/products/${product.id}`}
                            aria-label={`View ${product.name}`}
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
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="app-registry-table-footer">
            <span className="app-registry-table-footer-label">
              Showing 1-{products.length} of {products.length} products
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
