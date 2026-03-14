import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { queryClient } from "@/app/queryClient";
import { categoriesService } from "@/services/endpoints/categoriesService";
import { useCategories, useProducts } from "@/services/hooks/useDomainQueries";
import { queryKeys } from "@/shared/constants/queryKeys";
import { DataTable } from "@/shared/ui/DataTable";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { SearchInput } from "@/shared/ui/SearchInput";

export function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const categoriesQuery = useCategories();
  const productsQuery = useProducts();

  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      categoriesService.create({
        id: `cat-${crypto.randomUUID().slice(0, 8)}`,
        name,
        description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      setOpenModal(false);
      setName("");
      setDescription("");
    },
  });

  if (categoriesQuery.isLoading || productsQuery.isLoading) return <LoadingState label="Loading categories..." />;
  if (categoriesQuery.error || productsQuery.error) return <ErrorState message="Failed to load categories." />;

  const rows = categories
    .filter((category) =>
      [category.name, category.description].join(" ").toLowerCase().includes(search.toLowerCase()),
    )
    .map((category) => ({
      ...category,
      productCount: products.filter((product) => product.categoryId === category.id).length,
    }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#003a4d]">Product Categories</h1>
          <p className="text-sm text-slate-500">Category structure used across inventory and discounts.</p>
        </div>
        <button
          className="rounded-lg bg-[#00526C] px-4 py-2 text-sm font-semibold text-white"
          onClick={() => setOpenModal(true)}
        >
          Add Category
        </button>
      </div>

      <div className="max-w-md">
        <SearchInput placeholder="Search categories..." value={search} onChange={setSearch} />
      </div>

      <DataTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={[
          {
            key: "name",
            header: "Name",
            render: (row) => <span className="font-semibold text-slate-800">{row.name}</span>,
          },
          {
            key: "description",
            header: "Description",
            render: (row) => row.description,
          },
          {
            key: "count",
            header: "Products",
            align: "right",
            render: (row) => row.productCount,
          },
        ]}
      />

      {openModal ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-bold text-[#003a4d]">Create Category</h3>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Category name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <textarea
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Description"
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm" onClick={() => setOpenModal(false)}>
                Cancel
              </button>
              <button
                className="rounded-lg bg-[#00526C] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                onClick={() => createMutation.mutate()}
                disabled={!name || !description || createMutation.isPending}
              >
                {createMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
