import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { queryClient } from "@/app/queryClient";
import {
  DataPanel,
  FieldGrid,
} from "@/features/inventory/shared/InventoryScaffold";
import { InlineComponentDialog } from "@/features/orders/components/InlineComponentDialog";
import { OrderEtaPanel } from "@/features/orders/components/OrderEtaPanel";
import { OrderLineBuilder } from "@/features/orders/components/OrderLineBuilder";
import { ProductionStepsEditor } from "@/features/orders/components/ProductionStepsEditor";
import { componentProductsService } from "@/services/endpoints/componentProductsService";
import { componentsService } from "@/services/endpoints/componentsService";
import { ordersService } from "@/services/endpoints/ordersService";
import {
  useBusinessSettings,
  useCategories,
  useComponentProducts,
  useComponents,
  useCustomerProducts,
  useCustomers,
  useProducts,
  useSupplierPurchaseOrderItems,
  useSupplierPurchaseOrders,
  useWorkCenters,
} from "@/services/hooks/useDomainQueries";
import { queryKeys } from "@/shared/constants/queryKeys";
import { formatDate, formatNok } from "@/shared/lib/format";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import {
  buildOrderPreview,
  createEmptyInlineComponentDraft,
  createEmptyOrderLine,
  createEmptyProductionStep,
  getCategoryName,
  toDateInputValue,
  toIsoFromDateInput,
  type InlineComponentDraft,
  type OrderLineDraft,
  type ProductionStepDraft,
} from "@/features/orders/model/orderHelpers";
import type { OrderStatus } from "@/shared/types/domain";

type OrderCreatePageProps = {
  onActionsChange?: (actions: ReactNode) => void;
};

function SnapshotCard({
  label,
  value,
  supporting,
  tone = "default",
}: {
  label: string;
  value: string;
  supporting: string;
  tone?: "default" | "brand" | "warning";
}) {
  return (
    <div
      className={[
        "min-h-[9.5rem] h-[9.5rem] rounded-sm border p-4 shadow-[0_4px_24px_-4px_rgba(25,28,30,0.06)] bg-white flex flex-col gap-3",
        tone === "brand" &&
          "bg-gradient-to-r from-[#004260] to-[#005b82] text-white border-transparent shadow-[0_10px_30px_-12px_rgba(0,66,96,0.35)]",
        tone === "warning" && "bg-amber-50 border-amber-200",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "text-[10px] font-black uppercase tracking-[0.18em]",
          tone === "brand" ? "text-white/80" : "text-slate-500",
        ].join(" ")}
      >
        {label}
      </div>
      <div
        className={[
          "text-2xl font-black leading-tight tracking-tight",
          tone === "brand"
            ? "text-white"
            : tone === "warning"
              ? "text-amber-900"
              : "text-slate-900",
        ].join(" ")}
      >
        {value}
      </div>
      <p
        className={
          tone === "brand" ? "text-xs text-white/80" : "text-xs text-slate-600"
        }
      >
        {supporting}
      </p>
    </div>
  );
}

export function OrderCreatePage({
  onActionsChange,
}: OrderCreatePageProps = {}) {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState("");
  const [orderDate, setOrderDate] = useState(toDateInputValue());
  const [deliveryLeadDays, setDeliveryLeadDays] = useState("5");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<OrderLineDraft[]>([
    createEmptyOrderLine("product"),
  ]);
  const [productionSteps, setProductionSteps] = useState<ProductionStepDraft[]>(
    [],
  );
  const [inlineComponentOpen, setInlineComponentOpen] = useState(false);
  const [inlineComponentDraft, setInlineComponentDraft] =
    useState<InlineComponentDraft>(createEmptyInlineComponentDraft());

  const customersQuery = useCustomers();
  const categoriesQuery = useCategories();
  const productsQuery = useProducts();
  const componentsQuery = useComponents();
  const componentProductsQuery = useComponentProducts();
  const customerProductsQuery = useCustomerProducts();
  const purchaseOrdersQuery = useSupplierPurchaseOrders();
  const purchaseOrderItemsQuery = useSupplierPurchaseOrderItems();
  const workCentersQuery = useWorkCenters();
  const businessSettingsQuery = useBusinessSettings();

  const isLoading =
    customersQuery.isLoading ||
    categoriesQuery.isLoading ||
    productsQuery.isLoading ||
    componentsQuery.isLoading ||
    componentProductsQuery.isLoading ||
    customerProductsQuery.isLoading ||
    purchaseOrdersQuery.isLoading ||
    purchaseOrderItemsQuery.isLoading ||
    workCentersQuery.isLoading ||
    businessSettingsQuery.isLoading;

  const isError =
    customersQuery.isError ||
    categoriesQuery.isError ||
    productsQuery.isError ||
    componentsQuery.isError ||
    componentProductsQuery.isError ||
    customerProductsQuery.isError ||
    purchaseOrdersQuery.isError ||
    purchaseOrderItemsQuery.isError ||
    workCentersQuery.isError ||
    businessSettingsQuery.isError;

  const customers = customersQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const components = componentsQuery.data ?? [];
  const componentProducts = componentProductsQuery.data ?? [];
  const customerProducts = customerProductsQuery.data ?? [];
  const purchaseOrders = purchaseOrdersQuery.data ?? [];
  const purchaseOrderItems = purchaseOrderItemsQuery.data ?? [];
  const workCenters = workCentersQuery.data ?? [];
  const businessSettings = businessSettingsQuery.data ?? {
    qualityCheckLeadDays: 0,
    packagingLeadDays: 0,
  };
  const productLookup = new Map(
    products.map((product) => [product.id, product]),
  );
  const componentLookup = new Map(
    components.map((component) => [component.id, component]),
  );
  const preview = buildOrderPreview({
    customerId,
    orderDate: toIsoFromDateInput(orderDate),
    deliveryLeadDays: Number(deliveryLeadDays) || 0,
    lines,
    productionSteps,
    products,
    components,
    componentProducts,
    customerProducts,
    purchaseOrders,
    purchaseOrderItems,
    businessSettings,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (targetStatus: OrderStatus) =>
      ordersService.create({
        customerId,
        orderDate: toIsoFromDateInput(orderDate),
        status: targetStatus,
        deliveryLeadDays: Number(deliveryLeadDays) || 0,
        notes,
        items: preview.lines.map((line) => ({
          itemType: line.itemType,
          itemId: line.itemId,
          quantity: line.quantity,
          discountType: line.discountType,
          discountValue: line.discountValue,
          manualUnitPrice: line.usesManualUnitPrice ? line.unitPrice : null,
        })),
        productionSteps: productionSteps
          .filter((step) => step.stepName.trim() && step.workCenterId)
          .map((step) => ({
            workCenterId: step.workCenterId,
            stepName: step.stepName.trim(),
            description: step.description.trim() || undefined,
            cost: Number(step.cost) || 0,
            timeHours: Number(step.timeHours) || 0,
            status: step.status || "pending",
          })),
      }),
    onSuccess: async (order) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.orders }),
        queryClient.invalidateQueries({ queryKey: queryKeys.orderItems }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.orderProductionSteps,
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.products }),
        queryClient.invalidateQueries({ queryKey: queryKeys.components }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.componentProducts,
        }),
      ]);
      navigate(`/orders/${order.id}`);
    },
  });

  const createInlineComponentMutation = useMutation({
    mutationFn: async (draft: InlineComponentDraft) => {
      const component = await componentsService.create({
        id: `comp-${Math.random().toString(36).slice(2, 10)}`,
        name: draft.name.trim(),
        sku: draft.sku.trim(),
        categoryId: draft.categoryId,
        description: draft.description.trim(),
        unit: draft.unit.trim() || "assembly",
        stockQuantity: 0,
        reservedQuantity: 0,
        standardProductionCost: Number(draft.standardProductionCost) || 0,
        status: draft.saveForFuture ? "active" : "inactive",
        imageUrl: null,
      });

      await componentProductsService.replace(
        component.id,
        draft.rows
          .filter((row) => row.productId && Number(row.quantity) > 0)
          .map((row) => ({
            id: row.id,
            productId: row.productId,
            quantity: Number(row.quantity) || 0,
          })),
      );

      return component;
    },
    onSuccess: async (component) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.components }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.componentProducts,
        }),
      ]);

      setLines((current) => [
        ...current,
        {
          ...createEmptyOrderLine("component"),
          itemId: component.id,
        },
      ]);
      setInlineComponentOpen(false);
      setInlineComponentDraft(createEmptyInlineComponentDraft());
    },
  });

  const hasValidLines = preview.lines.length > 0;
  const canSaveDraft =
    Boolean(customerId) && hasValidLines && !createOrderMutation.isPending;
  const canConfirm =
    Boolean(customerId) &&
    hasValidLines &&
    !preview.eta.blocked &&
    !createOrderMutation.isPending;
  const selectedCustomer = customers.find((item) => item.id === customerId);
  const materialStatus = preview.eta.blocked
    ? "Blocked"
    : preview.eta.waitingOnInbound
      ? "Inbound"
      : "Available";
  const uniqueCategoryIds = Array.from(
    new Set(
      preview.lines
        .map((line) =>
          line.itemType === "product"
            ? (productLookup.get(line.itemId)?.categoryId ?? "")
            : (componentLookup.get(line.itemId)?.categoryId ?? ""),
        )
        .filter(Boolean),
    ),
  );
  const bottleneckRows = preview.lines
    .flatMap((line) => line.componentBreakdown)
    .slice(0, 4);
  const workflowSteps = [
    {
      name: "Order setup",
      detail: selectedCustomer
        ? selectedCustomer.name
        : "Select customer and commitment date",
      done: Boolean(customerId),
    },
    {
      name: "Line items",
      detail: `${preview.itemCount} resolved commercial line(s)`,
      done: hasValidLines,
    },
    {
      name: "Production steps",
      detail: `${productionSteps.length} work-center activity entries`,
      done: productionSteps.length > 0,
    },
    {
      name: "ETA planning",
      detail: preview.eta.promisedEta
        ? formatDate(preview.eta.promisedEta)
        : "Pending promise window",
      done: Boolean(preview.eta.promisedEta),
    },
    {
      name: "Review",
      detail: canConfirm
        ? "Ready to confirm"
        : "Resolve missing commercial or material inputs",
      done: canConfirm,
    },
  ];

  const actionButtons = useMemo(
    () => (
      <>
        {/* <Link className="app-button-secondary" to="/orders">
          Back to orders
        </Link> */}
        <button
          type="button"
          className="app-button-secondary"
          disabled={!canSaveDraft}
          onClick={() => createOrderMutation.mutate("draft")}
        >
          {createOrderMutation.isPending ? "Saving..." : "Save draft"}
        </button>
        <button
          type="button"
          className="app-button-primary"
          disabled={!canConfirm}
          onClick={() => createOrderMutation.mutate("confirmed")}
        >
          {createOrderMutation.isPending ? "Confirming..." : "Confirm order"}
        </button>
      </>
    ),
    [canSaveDraft, canConfirm, createOrderMutation],
  );

  useEffect(() => {
    if (onActionsChange) {
      onActionsChange(actionButtons);
    }
  }, [onActionsChange, actionButtons]);

  if (isLoading) {
    return <LoadingState label="Preparing order workspace..." />;
  }

  if (isError) {
    return <ErrorState title="Could not prepare the order workspace." />;
  }

  return (
    <div className="app-page space-y-6">
      {/* <InventoryPageHeader
        eyebrow="Sales / Orders"
        title="Create order"
        description="Capture Lovold customer orders with product and component lines, inline component creation, production steps, and reservation-aware ETA planning."
        actions={actionButtons}
      /> */}

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4 xl:sticky xl:top-24 self-start">
          <section className="rounded-sm border border-slate-200 bg-white p-4 shadow-[0_4px_24px_-4px_rgba(25,28,30,0.06)]">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Workflow navigator
            </div>
            <div className="mt-4 space-y-3">
              {workflowSteps.map((step, index) => (
                <div
                  key={step.name}
                  className={[
                    "rounded-sm border px-4 py-3",
                    step.done
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-slate-50",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={[
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        step.done
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-600 border border-slate-200",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {step.name}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        {step.detail}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-sm border border-slate-200 bg-white p-4 shadow-[0_4px_24px_-4px_rgba(25,28,30,0.06)]">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Commitments
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-sm border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
                Reservation is triggered only when the order is confirmed.
              </div>
              <div className="rounded-sm border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
                QC: {businessSettings.qualityCheckLeadDays} day(s) | Packaging:{" "}
                {businessSettings.packagingLeadDays} day(s)
              </div>
            </div>
          </section>
        </aside>

        <div className="space-y-6">
          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <DataPanel
              title="Order setup"
              description="Set the customer, order date, delivery commitment, and commercial notes before building the lines."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="app-label">Customer</span>
                  <select
                    className="app-select"
                    value={customerId}
                    onChange={(event) => setCustomerId(event.target.value)}
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="app-label">Order date</span>
                  <input
                    className="app-input"
                    type="date"
                    value={orderDate}
                    onChange={(event) => setOrderDate(event.target.value)}
                  />
                </label>
                <label className="space-y-2">
                  <span className="app-label">Delivery lead time (days)</span>
                  <input
                    className="app-input"
                    type="number"
                    min="0"
                    value={deliveryLeadDays}
                    onChange={(event) =>
                      setDeliveryLeadDays(event.target.value)
                    }
                  />
                </label>
                <div className="rounded-sm border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="app-label">Fixed lead items</div>
                  <div className="mt-2 text-sm text-slate-600">
                    QC: {businessSettings.qualityCheckLeadDays} day(s) |
                    Packaging: {businessSettings.packagingLeadDays} day(s)
                  </div>
                </div>
                <label className="space-y-2 md:col-span-2">
                  <span className="app-label">Notes</span>
                  <textarea
                    className="app-textarea min-h-[120px]"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Project scope, customer handling notes, installation considerations..."
                  />
                </label>
              </div>
            </DataPanel>

            <DataPanel
              title="Commercial preview"
              description="Live pricing, stored promise visibility, and customer-specific agreement usage."
            >
              <FieldGrid
                fields={[
                  { label: "Subtotal", value: formatNok(preview.subtotal) },
                  {
                    label: "Discount total",
                    value: formatNok(preview.discountTotal),
                  },
                  {
                    label: "Material + standard cost",
                    value: formatNok(preview.costTotal),
                  },
                  { label: "Profit", value: formatNok(preview.profitTotal) },
                  {
                    label: "Promised ETA",
                    value: preview.eta.promisedEta
                      ? formatDate(preview.eta.promisedEta)
                      : "Pending",
                  },
                  {
                    label: "Customer selected",
                    value: selectedCustomer?.name ?? "Not selected",
                  },
                ]}
              />

              {!customerId ? (
                <div className="rounded-sm border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Select a customer to apply product-specific pricing agreements
                  to base products and derived component pricing.
                </div>
              ) : null}
            </DataPanel>
          </div>

          <OrderLineBuilder
            customerId={customerId}
            lines={lines}
            resolvedLines={preview.lines}
            products={products}
            components={components}
            componentProducts={componentProducts}
            customerProducts={customerProducts}
            onAddProduct={() =>
              setLines((current) => [
                ...current,
                createEmptyOrderLine("product"),
              ])
            }
            onAddComponent={() =>
              setLines((current) => [
                ...current,
                createEmptyOrderLine("component"),
              ])
            }
            onCreateInlineComponent={() => setInlineComponentOpen(true)}
            onChange={(id, patch) =>
              setLines((current) =>
                current.map((line) =>
                  line.id === id ? { ...line, ...patch } : line,
                ),
              )
            }
            onRemove={(id) =>
              setLines((current) =>
                current.length === 1
                  ? [createEmptyOrderLine("product")]
                  : current.filter((line) => line.id !== id),
              )
            }
          />

          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <ProductionStepsEditor
              steps={productionSteps}
              workCenters={workCenters}
              onAdd={() =>
                setProductionSteps((current) => [
                  ...current,
                  createEmptyProductionStep(),
                ])
              }
              onChange={(id, patch) =>
                setProductionSteps((current) =>
                  current.map((step) =>
                    step.id === id ? { ...step, ...patch } : step,
                  ),
                )
              }
              onRemove={(id) =>
                setProductionSteps((current) =>
                  current.filter((step) => step.id !== id),
                )
              }
            />

            <OrderEtaPanel
              eta={preview.eta}
              qualityCheckLeadDays={businessSettings.qualityCheckLeadDays}
              packagingLeadDays={businessSettings.packagingLeadDays}
            />
          </div>

          <section className="grid gap-4 2xl:grid-cols-2">
            <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-[0_4px_24px_-4px_rgba(25,28,30,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Draft workflow
                </div>
                <div
                  className={[
                    "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]",
                    preview.eta.blocked
                      ? "bg-rose-100 text-rose-700"
                      : preview.eta.waitingOnInbound
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-700",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {preview.eta.blocked
                    ? "Material blocked"
                    : preview.eta.waitingOnInbound
                      ? "Waiting on inbound"
                      : "Ready to promise"}
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {selectedCustomer?.name ?? "Customer not selected"}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Order date {formatDate(toIsoFromDateInput(orderDate))} |
                    Delivery lead {deliveryLeadDays} day(s)
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-sm border border-slate-200 bg-white px-4 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      Stored promise
                    </div>
                    <div className="mt-2 text-base font-semibold text-slate-900">
                      {preview.eta.promisedEta
                        ? formatDate(preview.eta.promisedEta)
                        : "Pending"}
                    </div>
                  </div>
                  <div className="rounded-sm border border-slate-200 bg-white px-4 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      Production plan
                    </div>
                    <div className="mt-2 text-base font-semibold text-slate-900">
                      {productionSteps.length} step(s)
                    </div>
                  </div>
                </div>
                <div className="rounded-sm border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Components can be created inline from this workspace when
                  ready-made stock does not exist but the underlying products
                  are available.
                </div>
              </div>
            </div>
            <DataPanel
              title="Execution notes"
              description="Operational references derived from the current draft."
            >
              <div className="grid gap-4 xl:grid-cols-3">
                <div className="rounded-sm border border-slate-200 bg-white px-4 py-4">
                  <div className="app-label">Inline component creation</div>
                  <p className="mt-2 text-sm text-slate-600">
                    Use the inline component dialog when the customer is
                    ordering an assembly that is not yet in ready-made stock. If
                    &quot;save for future&quot; is off, the component is stored
                    as inactive to avoid active-catalog reuse.
                  </p>
                </div>
                <div className="rounded-sm border border-slate-200 bg-white px-4 py-4">
                  <div className="app-label">Bottleneck materials</div>
                  <ul className="mt-2 space-y-2 text-sm text-slate-600">
                    {bottleneckRows.map((row) => (
                      <li key={`${row.productId}-${row.totalQuantity}`}>
                        {row.productName}: need {row.totalQuantity}, available{" "}
                        {row.availableQuantity}
                      </li>
                    ))}
                    {bottleneckRows.length === 0 ? (
                      <li>
                        Current lines do not include component breakdown
                        requirements yet.
                      </li>
                    ) : null}
                  </ul>
                </div>
                <div className="rounded-sm border border-slate-200 bg-white px-4 py-4">
                  <div className="app-label">Included categories</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {uniqueCategoryIds.length > 0 ? (
                      uniqueCategoryIds.map((categoryId) => (
                        <span
                          key={categoryId}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                        >
                          {getCategoryName(categories, categoryId)}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-600">
                        Categories will appear after you select products or
                        components.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </DataPanel>
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SnapshotCard
              label="Grand total"
              value={formatNok(preview.grandTotal)}
              supporting="Live selling value from the current commercial draft."
              tone="brand"
            />
            <SnapshotCard
              label="Lines ready"
              value={String(preview.itemCount)}
              supporting="Resolved sellable lines with pricing and quantity inputs."
            />

            <SnapshotCard
              label="Estimated profit"
              value={formatNok(preview.profitTotal)}
              supporting="Derived using material cost, production cost, and discounts."
            />
            <SnapshotCard
              label="Material status"
              value={materialStatus}
              supporting={
                preview.eta.blocked
                  ? "At least one line lacks enough available or inbound material."
                  : preview.eta.waitingOnInbound
                    ? "Inbound supply is part of the earliest promise path."
                    : "Current stock and ready-made inventory support the order."
              }
              tone={preview.eta.blocked ? "warning" : "default"}
            />
          </div>
        </div>
      </div>

      <InlineComponentDialog
        open={inlineComponentOpen}
        draft={inlineComponentDraft}
        categories={categories}
        products={products}
        saving={createInlineComponentMutation.isPending}
        onClose={() => {
          setInlineComponentOpen(false);
          setInlineComponentDraft(createEmptyInlineComponentDraft());
        }}
        onChange={setInlineComponentDraft}
        onSave={() =>
          createInlineComponentMutation.mutate(inlineComponentDraft)
        }
      />
    </div>
  );
}
