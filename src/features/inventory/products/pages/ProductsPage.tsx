import { useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

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

  if (categoriesQuery.isLoading || productsQuery.isLoading) {
    return <LoadingState label="Loading products..." />;
  }

  if (categoriesQuery.error || productsQuery.error) {
    return <ErrorState message="Failed to load products." />;
  }

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
    <Stack spacing={3}>
      <Box>
        <Typography variant="h1">Products Inventory</Typography>
        <Typography variant="body2" color="text.secondary">
          Stock health, pricing, and category mapping in one place.
        </Typography>
      </Box>

      <FilterBar>
        <Box sx={{ flex: 2, minWidth: 220 }}>
          <SearchInput
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={setSearch}
          />
        </Box>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryId}
            label="Category"
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <MenuItem value="">All categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
          {rows.length} products
        </Typography>
      </FilterBar>

      {rows.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try another search or category filter."
        />
      ) : (
        <DataTable
          rows={rows}
          rowKey={(row) => row.id}
          columns={[
            {
              key: "sku",
              header: "Product",
              render: (row) => (
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {row.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.sku}
                  </Typography>
                </Box>
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
    </Stack>
  );
}
