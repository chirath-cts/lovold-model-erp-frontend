import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";

import { queryClient } from "@/app/queryClient";
import { productsService } from "@/services/endpoints/productsService";
import { useCategories, useProductById } from "@/services/hooks/useDomainQueries";
import { queryKeys } from "@/shared/constants/queryKeys";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import {
  DataPanel,
  InventoryPageHeader,
} from "@/features/inventory/shared/InventoryScaffold";

const compactCurrency = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});

interface ProductFormState {
  name: string;
  sku: string;
  categoryId: string;
  imageUrl: string;
  basePrice: string;
  purchasePrice: string;
  unit: string;
  stockQuantity: string;
  reservedQuantity: string;
  reorderLevel: string;
  status: "active" | "inactive";
  description: string;
}

const emptyState: ProductFormState = {
  name: "",
  sku: "",
  categoryId: "",
  imageUrl: "",
  basePrice: "0",
  purchasePrice: "0",
  unit: "unit",
  stockQuantity: "0",
  reservedQuantity: "0",
  reorderLevel: "0",
  status: "active",
  description: "",
};

const createProductId = () =>
  `prod-${Math.random().toString(36).slice(2, 10)}`;

const toSafeNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const createSkuSuggestion = (name: string, categoryLabel?: string) => {
  const categoryToken = (categoryLabel ?? "lov")
    .replace(/[^a-z0-9]+/gi, "")
    .slice(0, 4)
    .toUpperCase();
  const nameToken = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part.replace(/[^a-z0-9]+/gi, "").slice(0, 4).toUpperCase())
    .filter(Boolean)
    .join("-");

  return [categoryToken, nameToken || "ITEM", Math.floor(100 + Math.random() * 900)].join(
    "-",
  );
};

export function ProductFormPage() {
  const navigate = useNavigate();
  const { productId = "" } = useParams();
  const isEdit = Boolean(productId);

  const productQuery = useProductById(isEdit ? productId : undefined);
  const categoriesQuery = useCategories();
  const [formDraft, setFormDraft] = useState<Partial<ProductFormState>>({});

  const baseForm: ProductFormState = productQuery.data
    ? {
        name: productQuery.data.name,
        sku: productQuery.data.sku,
        categoryId: productQuery.data.categoryId,
        imageUrl: productQuery.data.imageUrl ?? "",
        basePrice: String(productQuery.data.basePrice),
        purchasePrice: String(productQuery.data.purchasePrice),
        unit: productQuery.data.unit,
        stockQuantity: String(productQuery.data.stockQuantity),
        reservedQuantity: String(productQuery.data.reservedQuantity),
        reorderLevel: String(productQuery.data.reorderLevel),
        status: productQuery.data.status,
        description: productQuery.data.description,
      }
    : emptyState;
  const form = { ...baseForm, ...formDraft };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        id: productQuery.data?.id ?? createProductId(),
        name: form.name.trim(),
        sku: form.sku.trim(),
        categoryId: form.categoryId,
        imageUrl: form.imageUrl.trim() || null,
        basePrice: Number(form.basePrice),
        purchasePrice: Number(form.purchasePrice),
        unit: form.unit.trim(),
        stockQuantity: Number(form.stockQuantity),
        reservedQuantity: Number(form.reservedQuantity),
        reorderLevel: Number(form.reorderLevel),
        status: form.status,
        description: form.description.trim(),
      };

      if (isEdit) {
        return productsService.update(productId, payload);
      }

      return productsService.create(payload);
    },
    onSuccess: async (product) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.products });
      navigate(`/inventory/products/${product.id}`);
    },
  });

  if (categoriesQuery.isLoading || (isEdit && productQuery.isLoading)) {
    return <LoadingState label="Loading product form..." />;
  }

  if (categoriesQuery.isError || (isEdit && productQuery.isError)) {
    return <ErrorState title="Could not prepare the product form." />;
  }

  const categories = categoriesQuery.data ?? [];
  const canSave =
    form.name.trim() &&
    form.sku.trim() &&
    form.categoryId &&
    form.unit.trim();
  const selectedCategoryName =
    categories.find((category) => category.id === form.categoryId)?.name ?? "Unassigned";
  const basePrice = toSafeNumber(form.basePrice);
  const purchasePrice = toSafeNumber(form.purchasePrice);
  const stockQuantity = toSafeNumber(form.stockQuantity);
  const reservedQuantity = toSafeNumber(form.reservedQuantity);
  const reorderLevel = toSafeNumber(form.reorderLevel);
  const availableQuantity = Math.max(0, stockQuantity - reservedQuantity);
  const grossSpread = basePrice - purchasePrice;
  const grossMargin = basePrice > 0 ? Math.round((grossSpread / basePrice) * 100) : 0;
  const readinessChecks = [
    form.name.trim().length > 0,
    form.sku.trim().length > 0,
    Boolean(form.categoryId),
    form.description.trim().length > 0,
  ];
  const completedChecks = readinessChecks.filter(Boolean).length;

  const updateField = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) =>
    setFormDraft((current) => ({ ...current, [key]: value }));

  return (
    <div className="app-page">
      <InventoryPageHeader
        eyebrow="Inventory / Products"
        title={isEdit ? "Edit product" : "Create product"}
        description="Maintain a base Lovold sellable product with reservation-aware stock, pricing, and category classification."
        variant="ops"
        actions={
          <>
            <Link className="app-button-secondary-sharp" to={isEdit ? `/inventory/products/${productId}` : "/inventory/products"}>
              Cancel
            </Link>
            <button
              type="button"
              className="app-button-primary-sharp disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canSave || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? "Saving..." : isEdit ? "Save changes" : "Create product"}
            </button>
          </>
        }
      />

      <div className="app-ops-toolbar flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="app-ops-eyebrow">
            Catalog entry
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {isEdit
              ? "Refine pricing, stock thresholds, and catalog identity for this Lovold product."
              : "Initialize a new industrial asset inside the Lovold product ledger."}
          </p>
        </div>
        <div className="rounded-sm border border-slate-200 bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
          {isEdit ? "Editing live record" : "Draft mode"}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_360px]">
        <div className="space-y-6">
          <DataPanel
            title="General information"
            description="Capture the identity fields that control catalog display and commercial lookup."
            variant="ops"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="app-label">Product name</span>
                <input
                  className="app-input-sharp"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Feed blower unit, cage distribution manifold..."
                />
              </label>
              <label className="space-y-2">
                <span className="app-label">SKU identification</span>
                <div className="flex gap-2">
                  <input
                    className="app-input-sharp font-mono"
                    value={form.sku}
                    onChange={(event) => updateField("sku", event.target.value)}
                    placeholder="LOV-FEED-BLOW-420"
                  />
                  <button
                    type="button"
                    className="app-button-secondary-sharp shrink-0 px-3"
                    onClick={() =>
                      updateField(
                        "sku",
                        createSkuSuggestion(form.name, selectedCategoryName),
                      )
                    }
                  >
                    Generate
                  </button>
                </div>
              </label>
              <label className="space-y-2">
                <span className="app-label">Asset category</span>
                <select
                  className="app-select-sharp"
                  value={form.categoryId}
                  onChange={(event) => updateField("categoryId", event.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="app-label">Technical description</span>
                <textarea
                  className="app-textarea-sharp"
                  rows={5}
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Engineering notes, marine rating, project suitability, or installation context."
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="app-label">Image URL</span>
                <input
                  className="app-input-sharp"
                  value={form.imageUrl}
                  onChange={(event) => updateField("imageUrl", event.target.value)}
                  placeholder="https://..."
                />
              </label>
            </div>
          </DataPanel>

          <DataPanel
            title="Pricing strategy"
            description="Maintain the list price and purchase cost that drive order pricing and margin visibility."
            variant="ops"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2">
                <span className="app-label">Base price (NOK)</span>
                <input
                  className="app-input-sharp text-right font-mono"
                  type="number"
                  min="0"
                  value={form.basePrice}
                  onChange={(event) => updateField("basePrice", event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="app-label">Purchase price (NOK)</span>
                <input
                  className="app-input-sharp text-right font-mono"
                  type="number"
                  min="0"
                  value={form.purchasePrice}
                  onChange={(event) => updateField("purchasePrice", event.target.value)}
                />
              </label>
              <div className="space-y-2">
                <span className="app-label">Gross margin preview</span>
                <div className="flex h-[42px] items-center justify-end rounded-sm border border-slate-200 bg-slate-50 px-3.5 font-mono text-sm font-bold text-[var(--brand-900)]">
                  {grossMargin}%
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-sm border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Gross spread
                </div>
                <div className="mt-2 text-2xl font-black tracking-tight text-[var(--text-primary)]">
                  {compactCurrency.format(grossSpread)}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Difference between list price and purchase price.
                </p>
              </div>
              <div className="rounded-sm border border-slate-200 bg-white p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Category assignment
                </div>
                <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                  {selectedCategoryName}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Used by product filters and customer pricing lookup.
                </p>
              </div>
            </div>
          </DataPanel>
        </div>

        <aside className="space-y-6">
          <section className="app-ops-card app-ops-card-muted border-l-4 border-l-[var(--brand-700)] p-5">
            <div className="space-y-4">
              <div>
                <div className="app-ops-eyebrow">
                  Inventory thresholds
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Reservation-aware inputs that affect availability and reorder alerts.
                </p>
              </div>
              <label className="space-y-2">
                <span className="app-label">Unit</span>
                <input
                  className="app-input-sharp"
                  value={form.unit}
                  onChange={(event) => updateField("unit", event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="app-label">Stock quantity</span>
                <input
                  className="app-input-sharp font-mono"
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={(event) => updateField("stockQuantity", event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="app-label">Reserved quantity</span>
                <input
                  className="app-input-sharp font-mono"
                  type="number"
                  min="0"
                  value={form.reservedQuantity}
                  onChange={(event) => updateField("reservedQuantity", event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="app-label">Reorder level</span>
                <input
                  className="app-input-sharp font-mono"
                  type="number"
                  min="0"
                  value={form.reorderLevel}
                  onChange={(event) => updateField("reorderLevel", event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="app-label">Status</span>
                <select
                  className="app-select-sharp"
                  value={form.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as "active" | "inactive")
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>
          </section>

          <section className="app-ops-card p-4">
            <div className="overflow-hidden rounded-sm border border-dashed border-slate-200 bg-slate-50">
              <div className="aspect-square">
                {form.imageUrl ? (
                  <img
                    className="h-full w-full object-cover"
                    src={form.imageUrl}
                    alt={form.name || "Product preview"}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-slate-500">
                    <span className="text-[11px] font-black uppercase tracking-[0.18em]">
                      Product preview
                    </span>
                    <span>Add an image URL to preview the asset card.</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                Save readiness
              </div>
              <div className="text-sm font-semibold text-slate-800">
                {completedChecks}/4 core fields completed
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[var(--brand-700)]"
                  style={{ width: `${(completedChecks / 4) * 100}%` }}
                />
              </div>
              <div className="grid gap-3">
                <div className="rounded-sm border border-slate-200 bg-white p-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                    Available quantity
                  </div>
                  <div className="mt-2 text-xl font-black tracking-tight text-slate-800">
                    {availableQuantity} {form.unit || "units"}
                  </div>
                </div>
                <div className="rounded-sm border border-slate-200 bg-white p-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                    Reorder buffer
                  </div>
                  <div className="mt-2 text-xl font-black tracking-tight text-slate-800">
                    {Math.max(availableQuantity - reorderLevel, 0)} {form.unit || "units"}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
