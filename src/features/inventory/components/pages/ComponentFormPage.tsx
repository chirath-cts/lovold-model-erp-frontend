import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";

import { queryClient } from "@/app/queryClient";
import { componentProductsService } from "@/services/endpoints/componentProductsService";
import { componentsService } from "@/services/endpoints/componentsService";
import {
  useCategories,
  useComponentById,
  useComponentProducts,
  useProducts,
} from "@/services/hooks/useDomainQueries";
import { queryKeys } from "@/shared/constants/queryKeys";
import { CurrencyText } from "@/shared/ui/CurrencyText";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import {
  DataPanel,
  InventoryPageHeader,
} from "@/features/inventory/shared/InventoryScaffold";
import {
  createEntityId,
  getAvailableQuantity,
  getComponentFinancials,
} from "@/features/inventory/shared/catalogHelpers";
import type { Component, ComponentProduct } from "@/shared/types/domain";

interface CompositionFormRow {
  id: string;
  productId: string;
  quantity: string;
}

interface ComponentFormState {
  name: string;
  sku: string;
  categoryId: string;
  imageUrl: string;
  description: string;
  unit: string;
  stockQuantity: string;
  reservedQuantity: string;
  standardProductionCost: string;
  status: "active" | "inactive";
  composition: CompositionFormRow[];
}

const makeRow = (row?: ComponentProduct): CompositionFormRow => ({
  id: row?.id ?? createEntityId("row", "component"),
  productId: row?.productId ?? "",
  quantity: String(row?.quantity ?? 1),
});

const emptyState: ComponentFormState = {
  name: "",
  sku: "",
  categoryId: "",
  imageUrl: "",
  description: "",
  unit: "assembly",
  stockQuantity: "0",
  reservedQuantity: "0",
  standardProductionCost: "0",
  status: "active",
  composition: [makeRow()],
};

export function ComponentFormPage() {
  const navigate = useNavigate();
  const { componentId = "" } = useParams();
  const isEdit = Boolean(componentId);

  const componentQuery = useComponentById(isEdit ? componentId : undefined);
  const componentProductsQuery = useComponentProducts(isEdit ? componentId : undefined);
  const productsQuery = useProducts();
  const categoriesQuery = useCategories();
  const [formDraft, setFormDraft] = useState<Partial<ComponentFormState>>({});

  const baseForm: ComponentFormState = componentQuery.data
    ? {
        name: componentQuery.data.name,
        sku: componentQuery.data.sku,
        categoryId: componentQuery.data.categoryId,
        imageUrl: componentQuery.data.imageUrl ?? "",
        description: componentQuery.data.description,
        unit: componentQuery.data.unit,
        stockQuantity: String(componentQuery.data.stockQuantity),
        reservedQuantity: String(componentQuery.data.reservedQuantity),
        standardProductionCost: String(componentQuery.data.standardProductionCost),
        status: componentQuery.data.status,
        composition:
          componentProductsQuery.data?.length
            ? componentProductsQuery.data.map((row) => makeRow(row))
            : [makeRow()],
      }
    : emptyState;

  const form: ComponentFormState = {
    ...baseForm,
    ...formDraft,
    composition: formDraft.composition ?? baseForm.composition,
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const targetId = componentQuery.data?.id ?? createEntityId("comp", form.name);

      const payload = {
        id: targetId,
        name: form.name.trim(),
        sku: form.sku.trim(),
        categoryId: form.categoryId,
        imageUrl: form.imageUrl.trim() || null,
        description: form.description.trim(),
        unit: form.unit.trim(),
        stockQuantity: Number(form.stockQuantity),
        reservedQuantity: Number(form.reservedQuantity),
        standardProductionCost: Number(form.standardProductionCost),
        status: form.status,
      };

      if (isEdit) {
        await componentsService.update(componentId, payload);
      } else {
        await componentsService.create(payload);
      }

      await componentProductsService.replace(
        targetId,
        form.composition
          .filter((row) => row.productId && Number(row.quantity) > 0)
          .map((row) => ({
            id: row.id,
            productId: row.productId,
            quantity: Number(row.quantity),
          })),
      );

      return { id: targetId };
    },
    onSuccess: async (component) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.components }),
        queryClient.invalidateQueries({ queryKey: queryKeys.componentProducts }),
      ]);
      navigate(`/inventory/components/${component.id}`);
    },
  });

  if (
    categoriesQuery.isLoading ||
    productsQuery.isLoading ||
    (isEdit && (componentQuery.isLoading || componentProductsQuery.isLoading))
  ) {
    return <LoadingState label="Loading component form..." />;
  }

  if (
    categoriesQuery.isError ||
    productsQuery.isError ||
    (isEdit && (componentQuery.isError || componentProductsQuery.isError))
  ) {
    return <ErrorState title="Could not prepare the component form." />;
  }

  const previewComponent: Component = {
    id: componentId || "preview",
    name: form.name,
    sku: form.sku,
    categoryId: form.categoryId,
    imageUrl: form.imageUrl || null,
    description: form.description,
    unit: form.unit,
    stockQuantity: Number(form.stockQuantity),
    reservedQuantity: Number(form.reservedQuantity),
    standardProductionCost: Number(form.standardProductionCost),
    status: form.status,
  };

  const previewRows: ComponentProduct[] = form.composition
    .filter((row) => row.productId && Number(row.quantity) > 0)
    .map((row) => ({
      id: row.id,
      componentId: previewComponent.id,
      productId: row.productId,
      quantity: Number(row.quantity),
    }));

  const previewFinancials = getComponentFinancials(
    previewComponent,
    previewRows,
    productsQuery.data ?? [],
  );

  const canSave =
    form.name.trim() &&
    form.sku.trim() &&
    form.categoryId &&
    form.unit.trim() &&
    previewRows.length > 0;

  const updateField = <K extends keyof ComponentFormState>(
    key: K,
    value: ComponentFormState[K],
  ) => setFormDraft((current) => ({ ...current, [key]: value }));

  const updateRow = (id: string, patch: Partial<CompositionFormRow>) =>
    setFormDraft((current) => ({
      ...current,
      composition: form.composition.map((row) =>
        row.id === id ? { ...row, ...patch } : row,
      ),
    }));

  const addRow = () =>
    setFormDraft((current) => ({
      ...current,
      composition: [...form.composition, makeRow()],
    }));

  const removeRow = (id: string) =>
    setFormDraft((current) => ({
      ...current,
      composition:
        form.composition.length > 1
          ? form.composition.filter((row) => row.id !== id)
          : form.composition,
    }));

  return (
    <div className="app-page">
      <InventoryPageHeader
        eyebrow="Inventory / Components"
        title={isEdit ? "Edit component" : "Create component"}
        description="Define a finished Lovold component, including ready-made stock, standard production cost, and the underlying product composition."
        variant="ops"
        actions={
          <>
            <Link
              className="app-button-secondary-sharp"
              to={isEdit ? `/inventory/components/${componentId}` : "/inventory/components"}
            >
              Cancel
            </Link>
            <button
              type="button"
              className="app-button-primary-sharp disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canSave || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? "Saving..." : isEdit ? "Save changes" : "Create component"}
            </button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.9fr)]">
        <DataPanel
          title="Identity and composition"
          description="Components are sellable assemblies. Capture master data here, then define the base-product rows that make up one finished unit."
          variant="ops"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="app-label">Component name</span>
              <input
                className="app-input-sharp"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="app-label">SKU</span>
              <input
                className="app-input-sharp"
                value={form.sku}
                onChange={(event) => updateField("sku", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="app-label">Category</span>
              <select
                className="app-select-sharp"
                value={form.categoryId}
                onChange={(event) => updateField("categoryId", event.target.value)}
              >
                <option value="">Select category</option>
                {categoriesQuery.data?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="app-label">Unit</span>
              <input
                className="app-input-sharp"
                value={form.unit}
                onChange={(event) => updateField("unit", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="app-label">Image URL</span>
              <input
                className="app-input-sharp"
                value={form.imageUrl}
                onChange={(event) => updateField("imageUrl", event.target.value)}
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="app-label">Description</span>
              <textarea
                className="app-textarea-sharp"
                rows={4}
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
              />
            </label>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  Composition rows
                </div>
                <div className="text-sm text-slate-500">
                  Products and quantities required for one component unit.
                </div>
              </div>
              <button type="button" className="app-button-secondary-sharp" onClick={addRow}>
                Add product row
              </button>
            </div>

            {form.composition.map((row, index) => (
              <div
                key={row.id}
                className="grid gap-4 rounded-sm border border-slate-200 bg-slate-50 p-4 md:grid-cols-[minmax(0,1fr)_140px_auto]"
              >
                <label className="space-y-2">
                  <span className="app-label">Product {index + 1}</span>
                  <select
                    className="app-select-sharp"
                    value={row.productId}
                    onChange={(event) => updateRow(row.id, { productId: event.target.value })}
                  >
                    <option value="">Select product</option>
                    {productsQuery.data?.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="app-label">Qty / Unit</span>
                  <input
                    className="app-input-sharp"
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={(event) => updateRow(row.id, { quantity: event.target.value })}
                  />
                </label>
                <div className="flex items-end">
                  <button type="button" className="app-button-ghost-sharp" onClick={() => removeRow(row.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </DataPanel>

        <DataPanel
          title="Inventory and cost preview"
          description="Standard production cost is stored on the component master, then layered on top of the base-product composition."
          variant="ops"
        >
          <div className="space-y-4">
            <label className="space-y-2">
              <span className="app-label">Ready-made stock</span>
              <input
                className="app-input-sharp"
                type="number"
                min="0"
                value={form.stockQuantity}
                onChange={(event) => updateField("stockQuantity", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="app-label">Reserved stock</span>
              <input
                className="app-input-sharp"
                type="number"
                min="0"
                value={form.reservedQuantity}
                onChange={(event) => updateField("reservedQuantity", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="app-label">Standard production cost (NOK)</span>
              <input
                className="app-input-sharp"
                type="number"
                min="0"
                value={form.standardProductionCost}
                onChange={(event) =>
                  updateField("standardProductionCost", event.target.value)
                }
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

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <PreviewCard
              label="Derived price"
              value={<CurrencyText value={previewFinancials.derivedPrice} />}
            />
            <PreviewCard
              label="Derived cost"
              value={<CurrencyText value={previewFinancials.derivedCost} />}
            />
            <PreviewCard
              label="Material price"
              value={<CurrencyText value={previewFinancials.materialPrice} />}
            />
            <PreviewCard
              label="Available stock"
              value={
                <>
                  {getAvailableQuantity(
                    Number(form.stockQuantity),
                    Number(form.reservedQuantity),
                  )}{" "}
                  {form.unit}
                </>
              }
            />
          </div>
        </DataPanel>
      </div>
    </div>
  );
}

function PreviewCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-sm border border-slate-200 bg-slate-50 p-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-slate-800">{value}</div>
    </div>
  );
}
