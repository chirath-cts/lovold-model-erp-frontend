import { useState } from "react";
import { Link } from "react-router-dom";

import { useCategories, useProducts } from "@/services/hooks/useDomainQueries";
import { SearchIcon } from "@/shared/ui/icons";
import { CurrencyText } from "@/shared/ui/CurrencyText";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import {
  DataPanel,
  EmptyPanel,
  InventoryPageHeader,
} from "@/features/inventory/shared/InventoryScaffold";
import {
  getAvailableQuantity,
  getProductStockHealth,
} from "@/features/inventory/shared/catalogHelpers";

const compactNumber = new Intl.NumberFormat("en-US");
const currencyFormatter = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});

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
        actions={
          <Link className="app-button-primary" to="/inventory/products/new">
            Create product
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-12">
        <section className="app-card min-w-0 border-l-4 border-l-[var(--brand-700)] p-6 xl:col-span-4">
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
            <div className="rounded-2xl bg-[var(--brand-100)] px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-900)]">
              {compactNumber.format(products.length)} SKUs
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-600" />
            Available: {compactNumber.format(totalAvailable)} units
          </div>
        </section>

        <section className="app-card min-w-0 bg-[var(--surface-soft)] p-6 xl:col-span-4">
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
            <div className="rounded-2xl border border-[var(--border-soft)] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
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

        <section className="app-card min-w-0 border-amber-300 bg-amber-50 p-6 xl:col-span-2">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-800">
            Critical alert
          </p>
          <div className="mt-3 text-4xl font-black tracking-tight text-amber-950">
            {compactNumber.format(criticalCount)}
          </div>
          <p className="mt-1 text-sm font-medium text-amber-900/80">
            Products currently at or below reorder pressure.
          </p>
          <div className="mt-5 rounded-2xl bg-white/80 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-800">
            Review procurement exposure
          </div>
        </section>

        <section className="app-kpi-card min-w-0 bg-[var(--brand-900)] p-6 text-white xl:col-span-2">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">
            Inventory value
          </p>
          <div className="mt-3 break-words text-3xl font-black tracking-tight">
            {currencyFormatter.format(totalAssetValue)}
          </div>
          <p className="mt-2 text-sm font-medium text-white/80">
            Estimated list-price value of stocked product inventory.
          </p>
        </section>
      </div>

      <section className="app-card space-y-4 bg-[var(--surface-soft)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Catalog filters
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Filter by Lovold SKU, product name, category, or lifecycle status.
            </p>
          </div>
          <div className="rounded-full border border-[var(--border-soft)] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
            Active filters: {activeFilters}
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_220px_220px]">
          <label className="space-y-2">
            <span className="app-label">Filter by name or SKU</span>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                className="app-input pl-10"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Feed blower, LOV-FEED..."
              />
            </div>
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
            <span className="app-label">Lifecycle status</span>
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
      </section>

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
          <div className="app-table-shell overflow-x-auto">
            <table className="app-table w-full table-fixed">
              <thead>
                <tr>
                  <th className="w-[96px]">SKU</th>
                  <th className="w-[35%]">Product</th>
                  <th className="w-[124px]">Category</th>
                  <th className="w-[118px] text-right">Base price</th>
                  <th className="w-[68px] text-right">Stock</th>
                  <th className="w-[78px] text-right">Reserved</th>
                  <th className="w-[78px] text-right">Available</th>
                  <th className="w-[84px]">Health</th>
                  <th className="w-[84px]">Status</th>
                  <th className="w-[78px] text-right" aria-label="Actions" />
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
                    <tr key={product.id}>
                      <td className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--brand-700)]">
                        {product.sku}
                      </td>
                      <td>
                        <div className="flex items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)]">
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
                          <div className="min-w-0 space-y-1 pr-2">
                            <div className="text-[15px] font-semibold leading-5 text-[var(--text-primary)]">
                              {product.name}
                            </div>
                            <div className="truncate text-xs leading-5 text-[var(--text-secondary)]">
                              {product.description}
                            </div>
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                              {product.unit}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm leading-6 text-[var(--text-secondary)]">
                        {categoryLookup.get(product.categoryId) ?? "Unassigned"}
                      </td>
                      <td>
                        <div className="space-y-1 whitespace-nowrap text-right">
                          <div className="font-semibold text-[var(--text-primary)]">
                            <CurrencyText value={product.basePrice} />
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">
                            Buy <CurrencyText value={product.purchasePrice} />
                          </div>
                        </div>
                      </td>
                      <td className="text-right font-semibold">{product.stockQuantity}</td>
                      <td className="text-right font-semibold text-[var(--text-secondary)]">
                        {product.reservedQuantity}
                      </td>
                      <td className="text-right font-semibold text-[var(--brand-900)]">
                        {available}
                      </td>
                      <td>
                        <StatusBadge value={health} />
                      </td>
                      <td>
                        <StatusBadge value={product.status} />
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-3 text-sm font-semibold">
                          <Link
                            className="text-[var(--text-secondary)] hover:text-[var(--brand-900)] hover:underline"
                            to={`/inventory/products/${product.id}/edit`}
                          >
                            Edit
                          </Link>
                          <Link
                            className="text-[var(--brand-900)] hover:underline"
                            to={`/inventory/products/${product.id}`}
                          >
                            View
                          </Link>
                        </div>
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
