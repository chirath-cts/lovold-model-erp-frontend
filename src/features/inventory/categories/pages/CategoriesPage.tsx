import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { queryClient } from "@/app/queryClient";
import { categoriesService } from "@/services/endpoints/categoriesService";
import { useCategories, useComponents, useProducts } from "@/services/hooks/useDomainQueries";
import { queryKeys } from "@/shared/constants/queryKeys";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import {
  DataPanel,
  EmptyPanel,
  InventoryPageHeader,
  SummaryCard,
} from "@/features/inventory/shared/InventoryScaffold";

const createCategoryId = () =>
  `cat-${Math.random().toString(36).slice(2, 10)}`;

export function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");

  const categoriesQuery = useCategories();
  const productsQuery = useProducts();
  const componentsQuery = useComponents();

  const createMutation = useMutation({
    mutationFn: async () =>
      categoriesService.create({
        id: createCategoryId(),
        name: draftName.trim(),
        description: draftDescription.trim(),
      }),
    onSuccess: async () => {
      setDraftName("");
      setDraftDescription("");
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });

  if (
    categoriesQuery.isLoading ||
    productsQuery.isLoading ||
    componentsQuery.isLoading
  ) {
    return <LoadingState label="Loading category classifications..." />;
  }

  if (categoriesQuery.isError || productsQuery.isError || componentsQuery.isError) {
    return <ErrorState title="Could not load category classifications." />;
  }

  const products = productsQuery.data ?? [];
  const components = componentsQuery.data ?? [];
  const categories = (categoriesQuery.data ?? []).filter((category) => {
    const needle = search.trim().toLowerCase();
    if (!needle) return true;
    return (
      category.name.toLowerCase().includes(needle) ||
      category.description.toLowerCase().includes(needle)
    );
  });

  const usageCount = (categoryId: string) =>
    products.filter((product) => product.categoryId === categoryId).length +
    components.filter((component) => component.categoryId === categoryId).length;

  return (
    <div className="app-page">
      <InventoryPageHeader
        eyebrow="Inventory / Categories"
        title="Classification Categories"
        description="Lightweight Lovold classifications used across both products and components."
        variant="ops"
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <SummaryCard
          label="Total categories"
          value={String(categoriesQuery.data?.length ?? 0)}
          supporting="Shared across products and components."
          variant="ops"
        />
        <SummaryCard
          label="Catalog assignments"
          value={String(products.length + components.length)}
          supporting="Products and components currently classified."
          variant="ops"
        />
        <SummaryCard
          label="Unused categories"
          value={String((categoriesQuery.data ?? []).filter((category) => usageCount(category.id) === 0).length)}
          supporting="Ready for future Lovold catalog expansion."
          variant="ops"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4">
          <section className="app-ops-toolbar space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-800">
                  Classification filters
                </h2>
                <p className="text-sm text-slate-500">
                  Search categories used across products and components.
                </p>
              </div>
              <div className="rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600 shadow-sm">
                Active search: {search.trim() ? "1" : "0"}
              </div>
            </div>

            <label className="space-y-2">
              <span className="app-label">Search</span>
              <input
                className="app-input-sharp"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Feeding, service, control..."
              />
            </label>
          </section>

          {categories.length === 0 ? (
            <EmptyPanel
              title="No categories match this search"
              copy="Try another keyword or create a new classification."
              variant="ops"
            />
          ) : (
            <section className="app-registry-table-block">
              <div className="app-registry-table-header">
                <div className="space-y-1">
                  <h2 className="app-registry-table-header-title">Categories</h2>
                  <p className="app-registry-table-header-copy">
                    Shared classifications across the Lovold inventory catalog.
                  </p>
                </div>
              </div>
              <div className="app-registry-table-scroll">
                <table className="app-registry-table app-registry-table-compact">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Description</th>
                    <th className="text-right">Catalog items</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="app-registry-table-row">
                      <td className="font-semibold text-slate-800">{category.name}</td>
                      <td>{category.description}</td>
                      <td className="text-right text-xs font-mono font-semibold text-slate-800">
                        {usageCount(category.id)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
              <div className="app-registry-table-footer">
                <span className="app-registry-table-footer-label">
                  Showing 1-{categories.length} of {categories.length} categories
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

        <DataPanel title="Create category" description="Current scope keeps categories lightweight: name plus description only." variant="ops">
          <div className="space-y-4">
            <label className="space-y-2">
              <span className="app-label">Name</span>
              <input className="app-input-sharp" value={draftName} onChange={(event) => setDraftName(event.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="app-label">Description</span>
              <textarea className="app-textarea-sharp" rows={5} value={draftDescription} onChange={(event) => setDraftDescription(event.target.value)} />
            </label>
            <button
              type="button"
              className="app-button-primary-sharp w-full disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!draftName.trim() || !draftDescription.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? "Saving..." : "Create category"}
            </button>
          </div>
        </DataPanel>
      </div>
    </div>
  );
}
