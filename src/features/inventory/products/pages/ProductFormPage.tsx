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

  const canSave =
    form.name.trim() &&
    form.sku.trim() &&
    form.categoryId &&
    form.unit.trim();

  const updateField = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) =>
    setFormDraft((current) => ({ ...current, [key]: value }));

  return (
    <div className="app-page">
      <InventoryPageHeader
        eyebrow="Inventory / Products"
        title={isEdit ? "Edit product" : "Create product"}
        description="Maintain a base Lovold sellable product with reservation-aware stock, pricing, and category classification."
        actions={
          <>
            <Link className="app-button-secondary" to={isEdit ? `/inventory/products/${productId}` : "/inventory/products"}>
              Cancel
            </Link>
            <button
              type="button"
              className="app-button-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canSave || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? "Saving..." : isEdit ? "Save changes" : "Create product"}
            </button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
        <DataPanel title="Identity and commercial setup" description="Capture the fields that drive catalog display, pricing, and customer agreements.">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="app-label">Product name</span>
              <input className="app-input" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="app-label">SKU</span>
              <input className="app-input" value={form.sku} onChange={(event) => updateField("sku", event.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="app-label">Category</span>
              <select className="app-select" value={form.categoryId} onChange={(event) => updateField("categoryId", event.target.value)}>
                <option value="">Select category</option>
                {categoriesQuery.data?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="app-label">Description</span>
              <textarea className="app-textarea" rows={5} value={form.description} onChange={(event) => updateField("description", event.target.value)} />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="app-label">Image URL</span>
              <input className="app-input" value={form.imageUrl} onChange={(event) => updateField("imageUrl", event.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="app-label">Base price (NOK)</span>
              <input className="app-input" type="number" min="0" value={form.basePrice} onChange={(event) => updateField("basePrice", event.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="app-label">Purchase price (NOK)</span>
              <input className="app-input" type="number" min="0" value={form.purchasePrice} onChange={(event) => updateField("purchasePrice", event.target.value)} />
            </label>
          </div>
        </DataPanel>

        <DataPanel title="Inventory controls" description="These fields drive stock visibility, reservation calculations, and reorder pressure.">
          <div className="space-y-4">
            <label className="space-y-2">
              <span className="app-label">Unit</span>
              <input className="app-input" value={form.unit} onChange={(event) => updateField("unit", event.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="app-label">Stock quantity</span>
              <input className="app-input" type="number" min="0" value={form.stockQuantity} onChange={(event) => updateField("stockQuantity", event.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="app-label">Reserved quantity</span>
              <input className="app-input" type="number" min="0" value={form.reservedQuantity} onChange={(event) => updateField("reservedQuantity", event.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="app-label">Reorder level</span>
              <input className="app-input" type="number" min="0" value={form.reorderLevel} onChange={(event) => updateField("reorderLevel", event.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="app-label">Status</span>
              <select className="app-select" value={form.status} onChange={(event) => updateField("status", event.target.value as "active" | "inactive")}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>
        </DataPanel>
      </div>
    </div>
  );
}
