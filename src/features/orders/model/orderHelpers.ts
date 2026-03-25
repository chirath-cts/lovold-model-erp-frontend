import { computeLineTotals, computeOrderTotals } from "@/shared/lib/orderCalculations";
import { toFixed2 } from "@/shared/lib/format";
import type {
  BusinessSettings,
  Category,
  Component,
  ComponentProduct,
  Customer,
  CustomerProduct,
  CustomerProductStatus,
  DiscountType,
  Order,
  OrderItem,
  OrderItemType,
  OrderProductionStep,
  OrderStatus,
  Product,
  SupplierPurchaseOrder,
  SupplierPurchaseOrderItem,
  SupplierPurchaseOrderStatus,
  WorkCenter,
} from "@/shared/types/domain";

export interface OrderLineDraft {
  id: string;
  itemType: OrderItemType;
  itemId: string;
  quantity: string;
  discountType: DiscountType;
  discountValue: string;
  overrideUnitPrice: boolean;
  manualUnitPrice: string;
}

export interface ProductionStepDraft {
  id: string;
  workCenterId: string;
  stepName: string;
  description: string;
  cost: string;
  timeHours: string;
  status: OrderProductionStep["status"] | "";
}

export interface InlineComponentDraft {
  name: string;
  sku: string;
  categoryId: string;
  description: string;
  unit: string;
  standardProductionCost: string;
  saveForFuture: boolean;
  rows: Array<{
    id: string;
    productId: string;
    quantity: string;
  }>;
}

export interface ComponentBreakdownRow {
  productId: string;
  productName: string;
  productSku: string;
  quantityPerUnit: number;
  totalQuantity: number;
  effectiveUnitPrice: number;
  effectiveUnitCost: number;
  availableQuantity: number;
}

export interface ResolvedOrderLine {
  id: string;
  itemType: OrderItemType;
  itemId: string;
  itemName: string;
  itemSku: string;
  itemUnit: string;
  quantity: number;
  discountType: DiscountType;
  discountValue: number;
  unitPrice: number;
  unitCost: number;
  lineSubtotal: number;
  discountAmount: number;
  lineTotal: number;
  profitAmount: number;
  usesManualUnitPrice: boolean;
  componentBreakdown: ComponentBreakdownRow[];
}

export interface OrderEtaPreview {
  materialAvailabilityEta: string | null;
  productionCompletionEta: string | null;
  deliveryEta: string | null;
  promisedEta: string | null;
  waitingOnInbound: boolean;
  blocked: boolean;
  blockers: string[];
}

export interface OrderPreview {
  lines: ResolvedOrderLine[];
  subtotal: number;
  discountTotal: number;
  costTotal: number;
  profitTotal: number;
  grandTotal: number;
  itemCount: number;
  eta: OrderEtaPreview;
}

const activeInboundStatuses = new Set<SupplierPurchaseOrderStatus>([
  "ordered",
  "partially_received",
]);

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "draft",
  "confirmed",
  "reserved",
  "in_production",
  "ready",
  "dispatched",
  "delivered",
  "cancelled",
];

export const createDraftId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export const toDateInputValue = (value?: string | null) => {
  if (!value) return new Date().toISOString().slice(0, 10);
  return value.slice(0, 10);
};

export const toIsoFromDateInput = (value: string) =>
  new Date(`${value}T00:00:00.000Z`).toISOString();

export const getOrderCustomer = (customers: Customer[], customerId: string) =>
  customers.find((customer) => customer.id === customerId);

export const getOrderStatusStyles = (status: OrderStatus) => {
  switch (status) {
    case "draft":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "confirmed":
      return "border-sky-200 bg-sky-100 text-sky-800";
    case "reserved":
      return "border-indigo-200 bg-indigo-100 text-indigo-800";
    case "in_production":
      return "border-amber-200 bg-amber-100 text-amber-900";
    case "ready":
      return "border-emerald-200 bg-emerald-100 text-emerald-800";
    case "dispatched":
      return "border-cyan-200 bg-cyan-100 text-cyan-800";
    case "delivered":
      return "border-emerald-200 bg-emerald-100 text-emerald-900";
    case "cancelled":
      return "border-rose-200 bg-rose-100 text-rose-800";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
};

export const getNextOrderStatus = (status: OrderStatus): OrderStatus | null => {
  switch (status) {
    case "draft":
      return "confirmed";
    case "confirmed":
      return "reserved";
    case "reserved":
      return "in_production";
    case "in_production":
      return "ready";
    case "ready":
      return "dispatched";
    case "dispatched":
      return "delivered";
    default:
      return null;
  }
};

export const isTerminalOrderStatus = (status: OrderStatus) =>
  status === "delivered" || status === "cancelled";

export const isDelayedOrder = (order: Pick<Order, "status" | "promisedEta">) => {
  if (!order.promisedEta) return false;
  if (isTerminalOrderStatus(order.status)) return false;
  return new Date(order.promisedEta).getTime() < Date.now();
};

export const getAvailableQuantity = (stockQuantity: number, reservedQuantity: number) =>
  Math.max(0, stockQuantity - reservedQuantity);

const parseDate = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isActiveAgreement = (
  agreement: CustomerProduct,
  customerId: string,
  productId: string,
  orderDate: string,
) => {
  if (
    agreement.customerId !== customerId ||
    agreement.productId !== productId ||
    !agreement.isActive
  ) {
    return false;
  }

  const asOf = parseDate(orderDate);
  if (!asOf) return false;

  const start = parseDate(agreement.startDate);
  const end = parseDate(agreement.endDate);

  if (start && start.getTime() > asOf.getTime()) return false;
  if (end && end.getTime() < asOf.getTime()) return false;

  return agreement.status === "active" || deriveAgreementStatus(agreement) === "active";
};

const deriveAgreementStatus = (
  agreement: Pick<CustomerProduct, "startDate" | "endDate" | "isActive">,
): CustomerProductStatus => {
  if (!agreement.isActive) return "expired";

  const today = new Date();
  const start = parseDate(agreement.startDate);
  const end = parseDate(agreement.endDate);

  if (start && start > today) return "future";
  if (end && end < today) return "expired";
  return "active";
};

const getEffectiveProductPrice = (
  product: Product,
  customerId: string,
  orderDate: string,
  agreements: CustomerProduct[],
) => {
  const agreement = agreements.find((item) =>
    isActiveAgreement(item, customerId, product.id, orderDate),
  );

  if (!agreement) return product.basePrice;
  return toFixed2(product.basePrice * (1 - agreement.discountPercent / 100));
};

const getComponentRows = (
  componentId: string,
  componentProducts: ComponentProduct[],
  products: Product[],
  customerId: string,
  orderDate: string,
  agreements: CustomerProduct[],
  quantityMultiplier = 1,
): ComponentBreakdownRow[] => {
  const productLookup = new Map(products.map((product) => [product.id, product]));

  return componentProducts
    .filter((row) => row.componentId === componentId)
    .map((row) => {
      const product = productLookup.get(row.productId);
      const availableQuantity = product
        ? getAvailableQuantity(product.stockQuantity, product.reservedQuantity)
        : 0;

      return {
        productId: row.productId,
        productName: product?.name ?? "Unknown product",
        productSku: product?.sku ?? "N/A",
        quantityPerUnit: row.quantity,
        totalQuantity: row.quantity * quantityMultiplier,
        effectiveUnitPrice: product
          ? getEffectiveProductPrice(product, customerId, orderDate, agreements)
          : 0,
        effectiveUnitCost: product?.purchasePrice ?? 0,
        availableQuantity,
      };
    });
};

export const getComponentDerivedPrice = (
  component: Component,
  componentProducts: ComponentProduct[],
  products: Product[],
  customerId: string,
  orderDate: string,
  agreements: CustomerProduct[],
) => {
  const materialPrice = getComponentRows(
    component.id,
    componentProducts,
    products,
    customerId,
    orderDate,
    agreements,
  ).reduce((sum, row) => sum + row.effectiveUnitPrice * row.quantityPerUnit, 0);

  return toFixed2(materialPrice + component.standardProductionCost);
};

export const getComponentDerivedCost = (
  component: Component,
  componentProducts: ComponentProduct[],
  products: Product[],
) => {
  const productLookup = new Map(products.map((product) => [product.id, product]));
  const materialCost = componentProducts
    .filter((row) => row.componentId === component.id)
    .reduce((sum, row) => {
      const product = productLookup.get(row.productId);
      return sum + (product?.purchasePrice ?? 0) * row.quantity;
    }, 0);

  return toFixed2(materialCost + component.standardProductionCost);
};

interface InboundBucket {
  purchaseOrderItemId: string;
  eta: string;
  quantity: number;
}

interface PlanningState {
  productAvailable: Map<string, number>;
  componentAvailable: Map<string, number>;
  inboundByProduct: Map<string, InboundBucket[]>;
}

const buildPlanningState = (
  products: Product[],
  components: Component[],
  purchaseOrders: SupplierPurchaseOrder[],
  purchaseOrderItems: SupplierPurchaseOrderItem[],
): PlanningState => {
  const productAvailable = new Map(
    products.map((product) => [
      product.id,
      getAvailableQuantity(product.stockQuantity, product.reservedQuantity),
    ]),
  );
  const componentAvailable = new Map(
    components.map((component) => [
      component.id,
      getAvailableQuantity(component.stockQuantity, component.reservedQuantity),
    ]),
  );
  const poLookup = new Map(purchaseOrders.map((purchaseOrder) => [purchaseOrder.id, purchaseOrder]));
  const inboundByProduct = new Map<string, InboundBucket[]>();

  purchaseOrderItems.forEach((item) => {
    const purchaseOrder = poLookup.get(item.purchaseOrderId);
    if (!purchaseOrder?.eta || !activeInboundStatuses.has(purchaseOrder.status)) return;
    if (item.remainingQuantity <= 0) return;

    const current = inboundByProduct.get(item.productId) ?? [];
    current.push({
      purchaseOrderItemId: item.id,
      eta: purchaseOrder.eta,
      quantity: item.remainingQuantity,
    });
    current.sort((left, right) => new Date(left.eta).getTime() - new Date(right.eta).getTime());
    inboundByProduct.set(item.productId, current);
  });

  return { productAvailable, componentAvailable, inboundByProduct };
};

const allocateInbound = (
  productId: string,
  requiredQuantity: number,
  planningState: PlanningState,
) => {
  const buckets = planningState.inboundByProduct.get(productId) ?? [];
  let remaining = requiredQuantity;
  let availableOn: string | null = null;

  for (const bucket of buckets) {
    if (remaining <= 0) break;
    const allocated = Math.min(bucket.quantity, remaining);
    if (allocated <= 0) continue;
    bucket.quantity -= allocated;
    remaining -= allocated;
    availableOn = bucket.eta;
  }

  return {
    fulfilled: remaining <= 0,
    availableOn: remaining <= 0 ? availableOn : null,
  };
};

const getLatestEta = (values: Array<string | null>) => {
  if (!values.length) return null;
  if (values.some((value) => value === null)) return null;

  return values.reduce<string | null>((latest, current) => {
    if (!current) return latest;
    if (!latest) return current;
    return new Date(current).getTime() > new Date(latest).getTime() ? current : latest;
  }, null);
};

const planProductMaterials = (
  productId: string,
  quantity: number,
  planningState: PlanningState,
  orderDate: string,
) => {
  const availableNow = planningState.productAvailable.get(productId) ?? 0;
  const consumeNow = Math.min(availableNow, quantity);
  planningState.productAvailable.set(productId, availableNow - consumeNow);

  const shortage = quantity - consumeNow;
  if (shortage <= 0) {
    return orderDate;
  }

  const inbound = allocateInbound(productId, shortage, planningState);
  return inbound.availableOn;
};

const planComponentMaterials = (
  componentId: string,
  quantity: number,
  planningState: PlanningState,
  orderDate: string,
  componentProducts: ComponentProduct[],
) => {
  const readyMadeAvailable = planningState.componentAvailable.get(componentId) ?? 0;
  const consumeReadyMade = Math.min(readyMadeAvailable, quantity);
  planningState.componentAvailable.set(componentId, readyMadeAvailable - consumeReadyMade);

  const remainder = quantity - consumeReadyMade;
  if (remainder <= 0) {
    return orderDate;
  }

  const rows = componentProducts.filter((row) => row.componentId === componentId);
  if (!rows.length) return null;

  const materialDates = rows.map((row) =>
    planProductMaterials(
      row.productId,
      row.quantity * remainder,
      planningState,
      orderDate,
    ),
  );

  return getLatestEta(materialDates);
};

const addDays = (value: string | null, days: number) => {
  if (!value) return null;
  const date = parseDate(value);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
};

export const buildOrderPreview = ({
  customerId,
  orderDate,
  deliveryLeadDays,
  lines,
  productionSteps,
  products,
  components,
  componentProducts,
  customerProducts,
  purchaseOrders,
  purchaseOrderItems,
  businessSettings,
}: {
  customerId: string;
  orderDate: string;
  deliveryLeadDays: number;
  lines: OrderLineDraft[];
  productionSteps: ProductionStepDraft[];
  products: Product[];
  components: Component[];
  componentProducts: ComponentProduct[];
  customerProducts: CustomerProduct[];
  purchaseOrders: SupplierPurchaseOrder[];
  purchaseOrderItems: SupplierPurchaseOrderItem[];
  businessSettings: BusinessSettings;
}): OrderPreview => {
  const validCustomerId = customerId.trim();
  const resolvedLines: ResolvedOrderLine[] = [];
  const productLookup = new Map(products.map((product) => [product.id, product]));
  const componentLookup = new Map(components.map((component) => [component.id, component]));

  lines.forEach((line) => {
    const quantity = Math.max(0, Number(line.quantity) || 0);
    if (!line.itemId || quantity <= 0) return;

    if (line.itemType === "product") {
      const product = productLookup.get(line.itemId);
      if (!product) return;

      const unitPrice = line.overrideUnitPrice && line.manualUnitPrice !== ""
        ? Number(line.manualUnitPrice) || 0
        : getEffectiveProductPrice(product, validCustomerId, orderDate, customerProducts);

      const computed = computeLineTotals({
        unitPrice,
        fixedCostPrice: product.purchasePrice,
        quantity,
        discountType: line.discountType,
        discountValue: Number(line.discountValue) || 0,
      });

      resolvedLines.push({
        id: line.id,
        itemType: line.itemType,
        itemId: product.id,
        itemName: product.name,
        itemSku: product.sku,
        itemUnit: product.unit,
        quantity,
        discountType: line.discountType,
        discountValue: Number(line.discountValue) || 0,
        unitPrice: toFixed2(unitPrice),
        unitCost: product.purchasePrice,
        lineSubtotal: computed.lineSubtotal,
        discountAmount: computed.discountAmount,
        lineTotal: computed.lineTotal,
        profitAmount: computed.profitAmount,
        usesManualUnitPrice: line.overrideUnitPrice && line.manualUnitPrice !== "",
        componentBreakdown: [],
      });

      return;
    }

    const component = componentLookup.get(line.itemId);
    if (!component) return;

    const breakdown = getComponentRows(
      component.id,
      componentProducts,
      products,
      validCustomerId,
      orderDate,
      customerProducts,
      quantity,
    );

    const derivedUnitPrice = getComponentDerivedPrice(
      component,
      componentProducts,
      products,
      validCustomerId,
      orderDate,
      customerProducts,
    );
    const unitPrice = line.overrideUnitPrice && line.manualUnitPrice !== ""
      ? Number(line.manualUnitPrice) || 0
      : derivedUnitPrice;
    const unitCost = getComponentDerivedCost(component, componentProducts, products);

    const computed = computeLineTotals({
      unitPrice,
      fixedCostPrice: unitCost,
      quantity,
      discountType: line.discountType,
      discountValue: Number(line.discountValue) || 0,
    });

    resolvedLines.push({
      id: line.id,
      itemType: line.itemType,
      itemId: component.id,
      itemName: component.name,
      itemSku: component.sku,
      itemUnit: component.unit,
      quantity,
      discountType: line.discountType,
      discountValue: Number(line.discountValue) || 0,
      unitPrice: toFixed2(unitPrice),
      unitCost,
      lineSubtotal: computed.lineSubtotal,
      discountAmount: computed.discountAmount,
      lineTotal: computed.lineTotal,
      profitAmount: computed.profitAmount,
      usesManualUnitPrice: line.overrideUnitPrice && line.manualUnitPrice !== "",
      componentBreakdown: breakdown,
    });
  });

  const totals = computeOrderTotals(
    resolvedLines.map((line) => ({
      discountAmount: line.discountAmount,
      lineSubtotal: line.lineSubtotal,
      lineTotal: line.lineTotal,
      profitAmount: line.profitAmount,
    })),
    resolvedLines.reduce((sum, line) => sum + line.unitCost * line.quantity, 0),
  );

  const planningState = buildPlanningState(
    products,
    components,
    purchaseOrders,
    purchaseOrderItems,
  );

  const materialDates = resolvedLines.map((line) =>
    line.itemType === "product"
      ? planProductMaterials(line.itemId, line.quantity, planningState, orderDate)
      : planComponentMaterials(
          line.itemId,
          line.quantity,
          planningState,
          orderDate,
          componentProducts,
        ),
  );

  const materialAvailabilityEta = getLatestEta(materialDates);
  const productionDays = Math.ceil(
    productionSteps.reduce((sum, step) => sum + (Number(step.timeHours) || 0), 0) / 8,
  );
  const productionCompletionEta = addDays(
    materialAvailabilityEta,
    productionDays +
      businessSettings.qualityCheckLeadDays +
      businessSettings.packagingLeadDays,
  );
  const deliveryEta = addDays(productionCompletionEta, deliveryLeadDays);
  const blockers = resolvedLines
    .filter((_, index) => materialDates[index] === null)
    .map((line) => `${line.itemName} cannot be fully covered by available or inbound supply.`);

  return {
    lines: resolvedLines,
    subtotal: totals.subtotal,
    discountTotal: totals.discountTotal,
    costTotal: totals.costTotal,
    profitTotal: totals.profitTotal,
    grandTotal: totals.grandTotal,
    itemCount: totals.itemCount,
    eta: {
      materialAvailabilityEta,
      productionCompletionEta,
      deliveryEta,
      promisedEta: deliveryEta,
      waitingOnInbound: materialDates.some(
        (value) => value !== null && value !== orderDate,
      ),
      blocked: blockers.length > 0,
      blockers,
    },
  };
};

export const buildComponentBreakdownFromOrderItem = ({
  item,
  components,
  componentProducts,
  products,
  customerProducts,
  orderDate,
  customerId,
}: {
  item: OrderItem;
  components: Component[];
  componentProducts: ComponentProduct[];
  products: Product[];
  customerProducts: CustomerProduct[];
  orderDate: string;
  customerId: string;
}) => {
  if (item.itemType !== "component") return [];
  const component = components.find((entry) => entry.id === item.itemId);
  if (!component) return [];

  return getComponentRows(
    component.id,
    componentProducts,
    products,
    customerId,
    orderDate,
    customerProducts,
    item.quantity,
  );
};

export const buildOrderDetailSummary = (
  order: Order,
  items: OrderItem[],
  steps: OrderProductionStep[],
  workCenters: WorkCenter[],
  customer: Customer | undefined,
) => {
  const productionCost = steps.reduce((sum, step) => sum + step.cost, 0);
  const totalHours = steps.reduce((sum, step) => sum + step.timeHours, 0);
  const workCenterLookup = new Map(
    workCenters.map((workCenter) => [workCenter.id, workCenter.name]),
  );

  return {
    customerName: customer?.name ?? "Unknown customer",
    totalLines: items.length,
    productionCost: toFixed2(productionCost),
    totalHours: toFixed2(totalHours),
    workCentersInUse: Array.from(
      new Set(steps.map((step) => workCenterLookup.get(step.workCenterId)).filter(Boolean)),
    ),
    delayed: isDelayedOrder(order),
  };
};

export const createEmptyOrderLine = (itemType: OrderItemType): OrderLineDraft => ({
  id: createDraftId("line"),
  itemType,
  itemId: "",
  quantity: "1",
  discountType: "percentage",
  discountValue: "0",
  overrideUnitPrice: false,
  manualUnitPrice: "",
});

export const createEmptyProductionStep = (): ProductionStepDraft => ({
  id: createDraftId("step"),
  workCenterId: "",
  stepName: "",
  description: "",
  cost: "0",
  timeHours: "0",
  status: "pending",
});

export const createEmptyInlineComponentDraft = (): InlineComponentDraft => ({
  name: "",
  sku: "",
  categoryId: "",
  description: "",
  unit: "assembly",
  standardProductionCost: "0",
  saveForFuture: true,
  rows: [
    {
      id: createDraftId("component-row"),
      productId: "",
      quantity: "1",
    },
  ],
});

export const getCategoryName = (categories: Category[], categoryId: string) =>
  categories.find((category) => category.id === categoryId)?.name ?? "Unassigned";
