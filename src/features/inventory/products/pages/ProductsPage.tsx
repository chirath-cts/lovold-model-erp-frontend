import { useState } from "react";

import { useCategories, useProducts } from "@/services/hooks/useDomainQueries";
import { CurrencyText } from "@/shared/ui/CurrencyText";
import { DataTable } from "@/shared/ui/DataTable";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { FilterBar } from "@/shared/ui/FilterBar";
import { LoadingState } from "@/shared/ui/LoadingState";
import { SearchInput } from "@/shared/ui/SearchInput";
import { StatusBadge } from "@/shared/ui/StatusBadge";

export function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const categoriesQuery = useCategories();
  const productsQuery = useProducts({ categoryId, nameLike: search });

  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data ?? [];

  if (categoriesQuery.isLoading || productsQuery.isLoading) return <LoadingState label="Loading products..." />;
  if (categoriesQuery.error || productsQuery.error) return <ErrorState message="Failed to load products." />;

  const categoryLookup = new Map(categories.map((item) => [item.id, item.name]));
  const rows = products.map((product) => ({
    ...product,
    stockHealth:
      product.stockQuantity <= product.reorderLevel
        ? "critical"
        : product.stockQuantity <= product.reorderLevel * 1.4
          ? "low"
          : "healthy",
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#003a4d]">Products Inventory</h1>
        <p className="text-sm text-slate-500">Stock health, pricing, and category mapping in one place.</p>
      </div>

      <FilterBar>
        <div className="md:col-span-2">
          <SearchInput placeholder="Search products by name or SKU..." value={search} onChange={setSearch} />
        </div>
        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600">{rows.length} products</div>
      </FilterBar>

      {rows.length === 0 ? (
        <EmptyState title="No products found" description="Try another search or category filter." />
      ) : (
        <DataTable
          rows={rows}
          rowKey={(row) => row.id}
          columns={[
            {
              key: "sku",
              header: "Product",
              render: (row) => (
                <div>
                  <p className="font-semibold text-slate-800">{row.name}</p>
                  <p className="text-xs text-slate-500">{row.sku}</p>
                </div>
              ),
            },
            {
              key: "category",
              header: "Category",
              render: (row) => categoryLookup.get(row.categoryId) ?? "-",
            },
            {
              key: "price",
              header: "Selling Price",
              align: "right",
              render: (row) => <CurrencyText value={row.unitPrice} />,
            },
            {
              key: "cost",
              header: "Fixed Cost",
              align: "right",
              render: (row) => <CurrencyText value={row.fixedCostPrice} />,
            },
            {
              key: "stock",
              header: "Stock",
              align: "right",
              render: (row) => `${row.stockQuantity} ${row.unit}`,
            },
            {
              key: "health",
              header: "Stock Status",
              render: (row) => <StatusBadge value={row.stockHealth} />,
            },
          ]}
        />
      )}
    </div>
  );
}
