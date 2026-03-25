import rawDb from "../../../mock/db.json";

import { computeLineTotals, computeOrderTotals } from "@/shared/lib/orderCalculations";
import { toFixed2 } from "@/shared/lib/format";
import type {
  BusinessSettings,
  Category,
  Component,
  ComponentProduct,
  CreateComponentPayload,
  CreateCustomerProductPayload,
  CreateOrderItemPayload,
  CreateOrderPayload,
  CreateProductPayload,
  Customer,
  CustomerProduct,
  CustomerProductStatus,
  EntityStatus,
  Order,
  OrderItem,
  OrderItemType,
  OrderProductionStep,
  OrderProductionStepStatus,
  OrderStatus,
  Product,
  Supplier,
  SupplierPurchaseOrder,
  SupplierPurchaseOrderItem,
  SupplierPurchaseOrderStatus,
  UpdateComponentPayload,
  UpdateCustomerProductPayload,
  UpdateOrderPayload,
  UpdateProductPayload,
  User,
  WorkCenter,
} from "@/shared/types/domain";

export interface ProductFilters {
  nameLike?: string;
  categoryId?: string;
  status?: EntityStatus | "";
}

export interface ComponentFilters {
  nameLike?: string;
  categoryId?: string;
  status?: EntityStatus | "";
}

export interface CustomerProductFilters {
  customerId?: string;
  productId?: string;
  status?: CustomerProductStatus | "";
}

export interface SupplierPurchaseOrderFilters {
  supplierId?: string;
  status?: SupplierPurchaseOrderStatus | "";
  query?: string;
}

export interface OrderFilters {
  status?: OrderStatus | "";
  customerId?: string;
  query?: string;
  delayedOnly?: boolean;
}

type MutableDb = {
  businessSettings: BusinessSettings;
  categories: Category[];
  products: Product[];
  components: Component[];
  componentProducts: ComponentProduct[];
  customers: Customer[];
  customerProducts: CustomerProduct[];
  suppliers: Supplier[];
  supplierPurchaseOrders: SupplierPurchaseOrder[];
  supplierPurchaseOrderItems: SupplierPurchaseOrderItem[];
  orders: Order[];
  orderItems: OrderItem[];
  orderProductionSteps: OrderProductionStep[];
  workCenters: WorkCenter[];
  users: User[];
};

interface ReservationLedgerEntry {
  productReservations: Array<{ productId: string; quantity: number }>;
  componentReservations: Array<{ componentId: string; quantity: number }>;
  inboundCommitments: Array<{ purchaseOrderItemId: string; quantity: number }>;
}

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

interface MaterialPlanResult {
  materialAvailabilityEta: string | null;
  reservation: ReservationLedgerEntry;
}

const clone = <T>(value: T): T =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));

const reservationStatuses = new Set<OrderStatus>([
  "confirmed",
  "reserved",
  "in_production",
  "ready",
  "dispatched",
]);

const activeInboundStatuses = new Set<SupplierPurchaseOrderStatus>([
  "ordered",
  "partially_received",
]);

const defaultBusinessSettings: BusinessSettings = {
  qualityCheckLeadDays: 1,
  packagingLeadDays: 1,
};

const parseDate = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toIsoString = (value: unknown, fallback?: string | null) => {
  if (value === null) return null;
  const date = parseDate(typeof value === "string" ? value : String(value ?? ""));
  if (date) return date.toISOString();
  return fallback ?? null;
};

const toStatus = (value: unknown): EntityStatus =>
  value === "inactive" ? "inactive" : "active";

const toOrderStatus = (value: unknown): OrderStatus => {
  switch (value) {
    case "draft":
    case "confirmed":
    case "reserved":
    case "in_production":
    case "ready":
    case "dispatched":
    case "delivered":
    case "cancelled":
      return value;
    default:
      return "draft";
  }
};

const toSupplierPurchaseOrderStatus = (
  value: unknown,
): SupplierPurchaseOrderStatus => {
  switch (value) {
    case "draft":
    case "ordered":
    case "partially_received":
    case "received":
    case "cancelled":
      return value;
    default:
      return "draft";
  }
};

const toProductionStepStatus = (
  value: unknown,
): OrderProductionStepStatus | undefined => {
  switch (value) {
    case "pending":
    case "in_progress":
    case "completed":
      return value;
    default:
      return undefined;
  }
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toNullableString = (value: unknown) =>
  value === null || value === undefined || value === "" ? null : String(value);

const deriveCustomerProductStatus = (
  agreement: Pick<CustomerProduct, "startDate" | "endDate" | "isActive">,
): CustomerProductStatus => {
  if (!agreement.isActive) return "expired";

  const today = new Date();
  const start = parseDate(agreement.startDate);
  const end = parseDate(agreement.endDate);

  if (start && start.getTime() > today.getTime()) return "future";
  if (end && end.getTime() < today.getTime()) return "expired";
  return "active";
};

const sortByName = <T extends { name: string }>(items: T[]) =>
  items
    .slice()
    .sort((left, right) =>
      left.name.localeCompare(right.name, undefined, { sensitivity: "base" }),
    );

const isReservationStatus = (status: OrderStatus) => reservationStatuses.has(status);

const createId = (prefix: string) => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

const emptyReservationEntry = (): ReservationLedgerEntry => ({
  productReservations: [],
  componentReservations: [],
  inboundCommitments: [],
});

const mergeReservationEntries = (
  target: ReservationLedgerEntry,
  source: ReservationLedgerEntry,
) => {
  target.productReservations.push(...source.productReservations);
  target.componentReservations.push(...source.componentReservations);
  target.inboundCommitments.push(...source.inboundCommitments);
};

const getLatestEta = (values: Array<string | null>) => {
  if (values.length === 0) return null;
  if (values.some((value) => value === null)) return null;

  return values.reduce<string | null>((latest, current) => {
    if (!current) return latest;
    if (!latest) return current;
    return new Date(current).getTime() > new Date(latest).getTime() ? current : latest;
  }, null);
};

const addDays = (value: string | null, days: number) => {
  if (!value) return null;
  const date = parseDate(value);
  if (!date) return null;

  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
};

const summarizeOrderItems = (items: OrderItem[]) => {
  const lines = items.map((item) => ({
    discountAmount: item.discountAmount,
    lineSubtotal: item.lineSubtotal,
    lineTotal: item.lineTotal,
    profitAmount: item.profitAmount,
  }));
  const totalCost = items.reduce(
    (sum, item) => sum + item.unitCostAtSale * item.quantity,
    0,
  );

  return computeOrderTotals(lines, totalCost);
};

const deriveOrderEtas = (
  businessSettings: BusinessSettings,
  materialAvailabilityEta: string | null,
  productionSteps: Array<Pick<OrderProductionStep, "timeHours">>,
  deliveryLeadDays: number,
) => {
  if (!materialAvailabilityEta) {
    return {
      materialAvailabilityEta: null,
      productionCompletionEta: null,
      deliveryEta: null,
      promisedEta: null,
    };
  }

  const productionDays = Math.ceil(
    productionSteps.reduce((sum, step) => sum + step.timeHours, 0) / 8,
  );
  const productionCompletionEta = addDays(
    materialAvailabilityEta,
    productionDays +
      businessSettings.qualityCheckLeadDays +
      businessSettings.packagingLeadDays,
  );
  const deliveryEta = addDays(productionCompletionEta, deliveryLeadDays);

  return {
    materialAvailabilityEta,
    productionCompletionEta,
    deliveryEta,
    promisedEta: deliveryEta,
  };
};

const normalizeDb = (source: typeof rawDb): MutableDb => {
  const businessSettings: BusinessSettings = {
    qualityCheckLeadDays: toNumber(
      source.businessSettings?.qualityCheckLeadDays,
      defaultBusinessSettings.qualityCheckLeadDays,
    ),
    packagingLeadDays: toNumber(
      source.businessSettings?.packagingLeadDays,
      defaultBusinessSettings.packagingLeadDays,
    ),
  };

  const categories: Category[] = Array.isArray(source.categories)
    ? source.categories.map((item) => ({
        id: String(item.id ?? ""),
        name: String(item.name ?? ""),
        description: String(item.description ?? ""),
      }))
    : [];

  const products: Product[] = Array.isArray(source.products)
    ? source.products.map((item) => ({
        id: String(item.id ?? ""),
        name: String(item.name ?? ""),
        sku: String(item.sku ?? ""),
        categoryId: String(item.categoryId ?? ""),
        imageUrl: toNullableString(item.imageUrl),
        basePrice: toNumber(item.basePrice),
        purchasePrice: toNumber(item.purchasePrice),
        unit: String(item.unit ?? "unit"),
        stockQuantity: toNumber(item.stockQuantity),
        reservedQuantity: toNumber(item.reservedQuantity),
        reorderLevel: toNumber(item.reorderLevel),
        description: String(item.description ?? ""),
        status: toStatus(item.status),
      }))
    : [];

  const components: Component[] = Array.isArray(source.components)
    ? source.components.map((item) => ({
        id: String(item.id ?? ""),
        name: String(item.name ?? ""),
        sku: String(item.sku ?? ""),
        categoryId: String(item.categoryId ?? ""),
        imageUrl: toNullableString(item.imageUrl),
        description: String(item.description ?? ""),
        unit: String(item.unit ?? "unit"),
        stockQuantity: toNumber(item.stockQuantity),
        reservedQuantity: toNumber(item.reservedQuantity),
        standardProductionCost: toNumber(item.standardProductionCost),
        status: toStatus(item.status),
      }))
    : [];

  const componentProducts: ComponentProduct[] = Array.isArray(source.componentProducts)
    ? source.componentProducts.map((item) => ({
        id: String(item.id ?? createId("cp")),
        componentId: String(item.componentId ?? ""),
        productId: String(item.productId ?? ""),
        quantity: toNumber(item.quantity, 1),
      }))
    : [];

  const customers: Customer[] = Array.isArray(source.customers)
    ? source.customers.map((item) => ({
        id: String(item.id ?? ""),
        customerCode: String(item.customerCode ?? ""),
        name: String(item.name ?? ""),
        email: String(item.email ?? ""),
        phone: String(item.phone ?? ""),
        address: String(item.address ?? ""),
        status: toStatus(item.status),
      }))
    : [];

  const customerProducts: CustomerProduct[] = Array.isArray(source.customerProducts)
    ? source.customerProducts.map((item) => {
        const normalized: CustomerProduct = {
          id: String(item.id ?? createId("cpa")),
          customerId: String(item.customerId ?? ""),
          productId: String(item.productId ?? ""),
          discountPercent: toNumber(item.discountPercent),
          startDate: toIsoString(item.startDate),
          endDate: toIsoString(item.endDate),
          isActive: Boolean(item.isActive),
          status: "active",
        };

        normalized.status = deriveCustomerProductStatus(normalized);
        return normalized;
      })
    : [];

  const suppliers: Supplier[] = Array.isArray(source.suppliers)
    ? source.suppliers.map((item) => ({
        id: String(item.id ?? ""),
        name: String(item.name ?? ""),
        email: String(item.email ?? ""),
        phone: String(item.phone ?? ""),
        address: String(item.address ?? ""),
        status: toStatus(item.status),
      }))
    : [];

  const supplierPurchaseOrders: SupplierPurchaseOrder[] = Array.isArray(
    source.supplierPurchaseOrders,
  )
    ? source.supplierPurchaseOrders.map((item) => ({
        id: String(item.id ?? ""),
        poNumber: String(item.poNumber ?? ""),
        supplierId: String(item.supplierId ?? ""),
        orderDate: toIsoString(item.orderDate, new Date().toISOString()) ?? new Date().toISOString(),
        eta: toIsoString(item.eta),
        status: toSupplierPurchaseOrderStatus(item.status),
        notes: String(item.notes ?? ""),
      }))
    : [];

  const supplierPurchaseOrderItems: SupplierPurchaseOrderItem[] = Array.isArray(
    source.supplierPurchaseOrderItems,
  )
    ? source.supplierPurchaseOrderItems.map((item) => {
        const orderedQuantity = toNumber(item.orderedQuantity);
        const receivedQuantity = toNumber(item.receivedQuantity);
        return {
          id: String(item.id ?? ""),
          purchaseOrderId: String(item.purchaseOrderId ?? ""),
          productId: String(item.productId ?? ""),
          orderedQuantity,
          receivedQuantity,
          remainingQuantity: Math.max(
            0,
            toNumber(item.remainingQuantity, orderedQuantity - receivedQuantity),
          ),
          unitCost: toNumber(item.unitCost),
        };
      })
    : [];

  const orders: Order[] = Array.isArray(source.orders)
    ? source.orders.map((item) => ({
        id: String(item.id ?? ""),
        orderNumber: String(item.orderNumber ?? ""),
        customerId: String(item.customerId ?? ""),
        orderDate:
          toIsoString(item.orderDate, new Date().toISOString()) ?? new Date().toISOString(),
        status: toOrderStatus(item.status),
        currency: "NOK",
        subtotal: toNumber(item.subtotal),
        discountTotal: toNumber(item.discountTotal),
        costTotal: toNumber(item.costTotal),
        profitTotal: toNumber(item.profitTotal),
        grandTotal: toNumber(item.grandTotal),
        itemCount: toNumber(item.itemCount),
        materialAvailabilityEta: toIsoString(item.materialAvailabilityEta),
        productionCompletionEta: toIsoString(item.productionCompletionEta),
        deliveryEta: toIsoString(item.deliveryEta),
        promisedEta: toIsoString(item.promisedEta),
        deliveryLeadDays: toNumber(item.deliveryLeadDays),
        notes: String(item.notes ?? ""),
      }))
    : [];

  const orderItems: OrderItem[] = Array.isArray(source.orderItems)
    ? (source.orderItems as Array<Record<string, unknown>>).map((item) => {
        const itemType: OrderItemType =
          item.itemType === "component" ? "component" : "product";
        const fallbackItemId =
          itemType === "component" ? String(item.componentId ?? "") : String(item.productId ?? "");

        return {
          id: String(item.id ?? createId("oi")),
          orderId: String(item.orderId ?? ""),
          itemType,
          itemId: String(item.itemId ?? fallbackItemId),
          itemName: String(item.itemName ?? item.productName ?? ""),
          itemSku: String(item.itemSku ?? item.productSku ?? ""),
          itemUnit: String(item.itemUnit ?? item.productUnit ?? "unit"),
          quantity: toNumber(item.quantity, 1),
          unitPrice: toNumber(item.unitPrice),
          lineSubtotal: toNumber(item.lineSubtotal),
          discountPercent: toNumber(item.discountPercent),
          discountAmount: toNumber(item.discountAmount),
          lineTotal: toNumber(item.lineTotal),
          unitCostAtSale: toNumber(item.unitCostAtSale),
          profitAmount: toNumber(item.profitAmount),
        };
      })
    : [];

  const itemCountByOrderId = orderItems.reduce((map, item) => {
    map.set(item.orderId, (map.get(item.orderId) ?? 0) + 1);
    return map;
  }, new Map<string, number>());

  orders.forEach((order) => {
    order.itemCount = itemCountByOrderId.get(order.id) ?? 0;
  });

  const orderProductionSteps: OrderProductionStep[] = Array.isArray(
    source.orderProductionSteps,
  )
    ? source.orderProductionSteps.map((item) => ({
        id: String(item.id ?? createId("ops")),
        orderId: String(item.orderId ?? ""),
        workCenterId: String(item.workCenterId ?? ""),
        stepName: String(item.stepName ?? ""),
        description: item.description ? String(item.description) : undefined,
        cost: toNumber(item.cost),
        timeHours: toNumber(item.timeHours),
        status: toProductionStepStatus(item.status),
      }))
    : [];

  const workCenters: WorkCenter[] = Array.isArray(source.workCenters)
    ? source.workCenters.map((item) => ({
        id: String(item.id ?? ""),
        name: String(item.name ?? ""),
        description: item.description ? String(item.description) : undefined,
      }))
    : [];

  const users: User[] = Array.isArray(source.users)
    ? source.users.map((item) => ({
        id: String(item.id ?? ""),
        username: String(item.username ?? ""),
        password: String(item.password ?? ""),
        firstName: String(item.firstName ?? ""),
        lastName: String(item.lastName ?? ""),
        email: String(item.email ?? ""),
        role: String(item.role ?? ""),
        status: toStatus(item.status),
        createdAt:
          toIsoString(item.createdAt, new Date().toISOString()) ?? new Date().toISOString(),
      }))
    : [];

  return {
    businessSettings,
    categories,
    products,
    components,
    componentProducts,
    customers,
    customerProducts,
    suppliers,
    supplierPurchaseOrders,
    supplierPurchaseOrderItems,
    orders,
    orderItems,
    orderProductionSteps,
    workCenters,
    users,
  };
};

const db: MutableDb = normalizeDb(rawDb);
const reservationLedger = new Map<string, ReservationLedgerEntry>();

const findProduct = (productId: string) => db.products.find((item) => item.id === productId);
const findComponent = (componentId: string) =>
  db.components.find((item) => item.id === componentId);

const getComponentComposition = (componentId: string) =>
  db.componentProducts.filter((item) => item.componentId === componentId);

const getCommittedInboundByPoItem = () => {
  const committed = new Map<string, number>();

  reservationLedger.forEach((entry) => {
    entry.inboundCommitments.forEach((item) => {
      committed.set(
        item.purchaseOrderItemId,
        (committed.get(item.purchaseOrderItemId) ?? 0) + item.quantity,
      );
    });
  });

  return committed;
};

const buildPlanningState = (): PlanningState => {
  const productAvailable = new Map(
    db.products.map((product) => [
      product.id,
      Math.max(0, product.stockQuantity - product.reservedQuantity),
    ]),
  );
  const componentAvailable = new Map(
    db.components.map((component) => [
      component.id,
      Math.max(0, component.stockQuantity - component.reservedQuantity),
    ]),
  );
  const committedInbound = getCommittedInboundByPoItem();
  const poLookup = new Map(db.supplierPurchaseOrders.map((po) => [po.id, po]));
  const inboundByProduct = new Map<string, InboundBucket[]>();

  db.supplierPurchaseOrderItems.forEach((item) => {
    const purchaseOrder = poLookup.get(item.purchaseOrderId);
    if (!purchaseOrder?.eta || !activeInboundStatuses.has(purchaseOrder.status)) return;

    const availableQuantity = Math.max(
      0,
      item.remainingQuantity - (committedInbound.get(item.id) ?? 0),
    );

    if (availableQuantity <= 0) return;

    const current = inboundByProduct.get(item.productId) ?? [];
    current.push({
      purchaseOrderItemId: item.id,
      eta: purchaseOrder.eta,
      quantity: availableQuantity,
    });
    current.sort(
      (left, right) => new Date(left.eta).getTime() - new Date(right.eta).getTime(),
    );
    inboundByProduct.set(item.productId, current);
  });

  return { productAvailable, componentAvailable, inboundByProduct };
};

const getActiveCustomerAgreement = (
  customerId: string,
  productId: string,
  asOfDate: string,
) => {
  const asOf = parseDate(asOfDate);
  if (!asOf) return undefined;

  return db.customerProducts.find((agreement) => {
    if (
      agreement.customerId !== customerId ||
      agreement.productId !== productId ||
      !agreement.isActive
    ) {
      return false;
    }

    const start = parseDate(agreement.startDate);
    const end = parseDate(agreement.endDate);

    if (start && start.getTime() > asOf.getTime()) return false;
    if (end && end.getTime() < asOf.getTime()) return false;
    return true;
  });
};

const getEffectiveProductPrice = (
  productId: string,
  customerId: string,
  asOfDate: string,
) => {
  const product = findProduct(productId);
  if (!product) throw new Error("Product not found");

  const agreement = getActiveCustomerAgreement(customerId, productId, asOfDate);
  if (!agreement) return product.basePrice;

  return toFixed2(product.basePrice * (1 - agreement.discountPercent / 100));
};

const getDerivedComponentUnitPrice = (
  componentId: string,
  customerId: string,
  asOfDate: string,
) => {
  const component = findComponent(componentId);
  if (!component) throw new Error("Component not found");

  const materialPrice = getComponentComposition(componentId).reduce((sum, row) => {
    return sum + getEffectiveProductPrice(row.productId, customerId, asOfDate) * row.quantity;
  }, 0);

  return toFixed2(materialPrice + component.standardProductionCost);
};

const getDerivedComponentUnitCost = (componentId: string) => {
  const component = findComponent(componentId);
  if (!component) throw new Error("Component not found");

  const materialCost = getComponentComposition(componentId).reduce((sum, row) => {
    const product = findProduct(row.productId);
    return sum + (product?.purchasePrice ?? 0) * row.quantity;
  }, 0);

  return toFixed2(materialCost + component.standardProductionCost);
};

const allocateInboundQuantity = (
  productId: string,
  requiredQuantity: number,
  planningState: PlanningState,
) => {
  const buckets = planningState.inboundByProduct.get(productId) ?? [];
  const commitments: Array<{ purchaseOrderItemId: string; quantity: number }> = [];
  let remaining = requiredQuantity;
  let availableOn: string | null = null;

  for (const bucket of buckets) {
    if (remaining <= 0) break;

    const allocated = Math.min(bucket.quantity, remaining);
    if (allocated <= 0) continue;

    bucket.quantity -= allocated;
    remaining -= allocated;
    availableOn = bucket.eta;
    commitments.push({
      purchaseOrderItemId: bucket.purchaseOrderItemId,
      quantity: allocated,
    });
  }

  return {
    fulfilled: remaining <= 0,
    availableOn: remaining <= 0 ? availableOn : null,
    commitments,
  };
};

const planProductMaterials = (
  productId: string,
  quantity: number,
  planningState: PlanningState,
  orderDate: string,
): MaterialPlanResult => {
  const availableNow = planningState.productAvailable.get(productId) ?? 0;
  const reservedNow = Math.min(availableNow, quantity);
  planningState.productAvailable.set(productId, availableNow - reservedNow);

  const reservation = emptyReservationEntry();
  if (reservedNow > 0) {
    reservation.productReservations.push({ productId, quantity: reservedNow });
  }

  const shortage = quantity - reservedNow;
  if (shortage <= 0) {
    return {
      materialAvailabilityEta: orderDate,
      reservation,
    };
  }

  const inbound = allocateInboundQuantity(productId, shortage, planningState);
  reservation.inboundCommitments.push(...inbound.commitments);

  return {
    materialAvailabilityEta: inbound.availableOn,
    reservation,
  };
};

const planComponentMaterials = (
  componentId: string,
  quantity: number,
  planningState: PlanningState,
  orderDate: string,
): MaterialPlanResult => {
  const component = findComponent(componentId);
  if (!component) throw new Error("Component not found");

  const availableNow = planningState.componentAvailable.get(componentId) ?? 0;
  const readyMadeUnits = Math.min(availableNow, quantity);
  planningState.componentAvailable.set(componentId, availableNow - readyMadeUnits);

  const reservation = emptyReservationEntry();
  if (readyMadeUnits > 0) {
    reservation.componentReservations.push({
      componentId,
      quantity: readyMadeUnits,
    });
  }

  const remainder = quantity - readyMadeUnits;
  if (remainder <= 0) {
    return {
      materialAvailabilityEta: orderDate,
      reservation,
    };
  }

  const composition = getComponentComposition(componentId);
  if (composition.length === 0) {
    return {
      materialAvailabilityEta: null,
      reservation,
    };
  }

  const materialDates: Array<string | null> = [];

  composition.forEach((row) => {
    const productPlan = planProductMaterials(
      row.productId,
      row.quantity * remainder,
      planningState,
      orderDate,
    );

    materialDates.push(productPlan.materialAvailabilityEta);
    mergeReservationEntries(reservation, productPlan.reservation);
  });

  return {
    materialAvailabilityEta: getLatestEta(materialDates),
    reservation,
  };
};

const buildOrderItemSnapshot = (
  line: CreateOrderPayload["items"][number],
  customerId: string,
  orderDate: string,
  orderId: string,
  index: number,
): OrderItem => {
  let itemName = "";
  let itemSku = "";
  let itemUnit = "unit";
  let unitPrice = 0;
  let unitCostAtSale = 0;

  if (line.itemType === "product") {
    const product = findProduct(line.itemId);
    if (!product) throw new Error("Product not found");

    itemName = product.name;
    itemSku = product.sku;
    itemUnit = product.unit;
    unitPrice =
      line.manualUnitPrice ?? getEffectiveProductPrice(product.id, customerId, orderDate);
    unitCostAtSale = product.purchasePrice;
  } else {
    const component = findComponent(line.itemId);
    if (!component) throw new Error("Component not found");

    itemName = component.name;
    itemSku = component.sku;
    itemUnit = component.unit;
    unitPrice =
      line.manualUnitPrice ??
      getDerivedComponentUnitPrice(component.id, customerId, orderDate);
    unitCostAtSale = getDerivedComponentUnitCost(component.id);
  }

  const computed = computeLineTotals({
    unitPrice,
    fixedCostPrice: unitCostAtSale,
    quantity: line.quantity,
    discountType: line.discountType,
    discountValue: line.discountValue,
  });

  const discountPercent =
    computed.lineSubtotal > 0
      ? toFixed2((computed.discountAmount / computed.lineSubtotal) * 100)
      : 0;

  return {
    id: createId(`oi-${index + 1}`),
    orderId,
    itemType: line.itemType,
    itemId: line.itemId,
    itemName,
    itemSku,
    itemUnit,
    quantity: line.quantity,
    unitPrice: toFixed2(unitPrice),
    lineSubtotal: computed.lineSubtotal,
    discountPercent,
    discountAmount: computed.discountAmount,
    lineTotal: computed.lineTotal,
    unitCostAtSale: toFixed2(unitCostAtSale),
    profitAmount: computed.profitAmount,
  };
};

const buildProductionSteps = (
  orderId: string,
  steps: CreateOrderPayload["productionSteps"],
) =>
  steps.map<OrderProductionStep>((step, index) => ({
    id: createId(`ops-${index + 1}`),
    orderId,
    workCenterId: step.workCenterId,
    stepName: step.stepName.trim(),
    description: step.description?.trim() || undefined,
    cost: toFixed2(step.cost),
    timeHours: toFixed2(step.timeHours),
    status: step.status ?? "pending",
  }));

const applyReservationEntry = (orderId: string, entry: ReservationLedgerEntry) => {
  entry.productReservations.forEach((reservation) => {
    const product = findProduct(reservation.productId);
    if (!product) return;
    product.reservedQuantity = toFixed2(product.reservedQuantity + reservation.quantity);
  });

  entry.componentReservations.forEach((reservation) => {
    const component = findComponent(reservation.componentId);
    if (!component) return;
    component.reservedQuantity = toFixed2(component.reservedQuantity + reservation.quantity);
  });

  reservationLedger.set(orderId, clone(entry));
};

const releaseReservationEntry = (orderId: string) => {
  const existing = reservationLedger.get(orderId);
  if (!existing) return;

  existing.productReservations.forEach((reservation) => {
    const product = findProduct(reservation.productId);
    if (!product) return;
    product.reservedQuantity = Math.max(
      0,
      toFixed2(product.reservedQuantity - reservation.quantity),
    );
  });

  existing.componentReservations.forEach((reservation) => {
    const component = findComponent(reservation.componentId);
    if (!component) return;
    component.reservedQuantity = Math.max(
      0,
      toFixed2(component.reservedQuantity - reservation.quantity),
    );
  });

  reservationLedger.delete(orderId);
};

const createOrderNumber = () => {
  const currentYear = new Date().getUTCFullYear();
  const sequence = 3000 + db.orders.length + 1;
  return `ORD-${currentYear}-${String(sequence).padStart(4, "0")}`;
};

const recomputeOrder = (orderId: string, next: Pick<Order, "status" | "orderDate" | "deliveryLeadDays">) => {
  const items = db.orderItems.filter((item) => item.orderId === orderId);
  const steps = db.orderProductionSteps.filter((step) => step.orderId === orderId);
  const planningState = buildPlanningState();
  const reservation = emptyReservationEntry();
  const materialDates: Array<string | null> = [];

  items.forEach((item) => {
    const plan =
      item.itemType === "product"
        ? planProductMaterials(item.itemId, item.quantity, planningState, next.orderDate)
        : planComponentMaterials(item.itemId, item.quantity, planningState, next.orderDate);

    materialDates.push(plan.materialAvailabilityEta);
    mergeReservationEntries(reservation, plan.reservation);
  });

  const etas = deriveOrderEtas(
    db.businessSettings,
    getLatestEta(materialDates),
    steps,
    next.deliveryLeadDays,
  );

  if (isReservationStatus(next.status)) {
    applyReservationEntry(orderId, reservation);
  }

  return etas;
};

const matchesText = (needle: string, ...values: Array<string | undefined>) =>
  values.some((value) => value?.toLowerCase().includes(needle));

export const mockDb = {
  async getBusinessSettings() {
    return clone(db.businessSettings);
  },

  async updateBusinessSettings(payload: Partial<BusinessSettings>) {
    db.businessSettings = {
      ...db.businessSettings,
      ...payload,
      qualityCheckLeadDays: toNumber(
        payload.qualityCheckLeadDays,
        db.businessSettings.qualityCheckLeadDays,
      ),
      packagingLeadDays: toNumber(
        payload.packagingLeadDays,
        db.businessSettings.packagingLeadDays,
      ),
    };

    return clone(db.businessSettings);
  },

  async listCategories() {
    return clone(sortByName(db.categories));
  },

  async addCategory(category: Category) {
    db.categories.push(category);
    return clone(category);
  },

  async listProducts(filters?: ProductFilters) {
    const needle = filters?.nameLike?.toLowerCase().trim();

    let results = sortByName(db.products);

    if (needle) {
      results = results.filter((product) =>
        matchesText(needle, product.name, product.sku, product.description),
      );
    }

    if (filters?.categoryId) {
      results = results.filter((product) => product.categoryId === filters.categoryId);
    }

    if (filters?.status) {
      results = results.filter((product) => product.status === filters.status);
    }

    return clone(results);
  },

  async getProductById(id: string) {
    const product = findProduct(id);
    if (!product) throw new Error("Product not found");
    return clone(product);
  },

  async addProduct(payload: CreateProductPayload) {
    const product: Product = {
      ...payload,
      imageUrl: payload.imageUrl ?? null,
      reservedQuantity: toNumber(payload.reservedQuantity),
      description: payload.description ?? "",
    };

    db.products.push(product);
    return clone(product);
  },

  async updateProduct(id: string, patch: UpdateProductPayload) {
    const product = findProduct(id);
    if (!product) throw new Error("Product not found");

    Object.assign(product, patch);
    if (patch.imageUrl !== undefined) {
      product.imageUrl = patch.imageUrl ?? null;
    }
    return clone(product);
  },

  async updateProductStock(id: string, stockQuantity: number) {
    const product = findProduct(id);
    if (!product) throw new Error("Product not found");

    product.stockQuantity = Math.max(0, toNumber(stockQuantity));
    return clone(product);
  },

  async listComponents(filters?: ComponentFilters) {
    const needle = filters?.nameLike?.toLowerCase().trim();
    let results = sortByName(db.components);

    if (needle) {
      results = results.filter((component) =>
        matchesText(needle, component.name, component.sku, component.description),
      );
    }

    if (filters?.categoryId) {
      results = results.filter((component) => component.categoryId === filters.categoryId);
    }

    if (filters?.status) {
      results = results.filter((component) => component.status === filters.status);
    }

    return clone(results);
  },

  async getComponentById(id: string) {
    const component = findComponent(id);
    if (!component) throw new Error("Component not found");
    return clone(component);
  },

  async addComponent(payload: CreateComponentPayload) {
    const component: Component = {
      ...payload,
      imageUrl: payload.imageUrl ?? null,
      reservedQuantity: toNumber(payload.reservedQuantity),
      description: payload.description ?? "",
    };

    db.components.push(component);
    return clone(component);
  },

  async updateComponent(id: string, patch: UpdateComponentPayload) {
    const component = findComponent(id);
    if (!component) throw new Error("Component not found");

    Object.assign(component, patch);
    if (patch.imageUrl !== undefined) {
      component.imageUrl = patch.imageUrl ?? null;
    }
    return clone(component);
  },

  async updateComponentStock(id: string, stockQuantity: number) {
    const component = findComponent(id);
    if (!component) throw new Error("Component not found");

    component.stockQuantity = Math.max(0, toNumber(stockQuantity));
    return clone(component);
  },

  async listComponentProducts(componentId?: string) {
    const items = componentId
      ? db.componentProducts.filter((item) => item.componentId === componentId)
      : db.componentProducts;

    return clone(items);
  },

  async replaceComponentProducts(
    componentId: string,
    rows: Array<Omit<ComponentProduct, "componentId"> & { id?: string }>,
  ) {
    db.componentProducts = db.componentProducts.filter(
      (item) => item.componentId !== componentId,
    );

    const nextRows = rows.map<ComponentProduct>((row) => ({
      id: row.id ?? createId("cp"),
      componentId,
      productId: row.productId,
      quantity: toNumber(row.quantity, 1),
    }));

    db.componentProducts.push(...nextRows);
    return clone(nextRows);
  },

  async listCustomers() {
    return clone(sortByName(db.customers));
  },

  async getCustomerById(id: string) {
    const customer = db.customers.find((item) => item.id === id);
    if (!customer) throw new Error("Customer not found");
    return clone(customer);
  },

  async listCustomerProducts(filters?: CustomerProductFilters) {
    let results = db.customerProducts.map((item) => ({
      ...item,
      status: deriveCustomerProductStatus(item),
    }));

    if (filters?.customerId) {
      results = results.filter((item) => item.customerId === filters.customerId);
    }

    if (filters?.productId) {
      results = results.filter((item) => item.productId === filters.productId);
    }

    if (filters?.status) {
      results = results.filter((item) => item.status === filters.status);
    }

    return clone(results);
  },

  async addCustomerProduct(payload: CreateCustomerProductPayload) {
    const agreement: CustomerProduct = {
      ...payload,
      id: payload.id ?? createId("cpa"),
      startDate: payload.startDate ? toIsoString(payload.startDate) : null,
      endDate: payload.endDate ? toIsoString(payload.endDate) : null,
      status: "active",
    };

    agreement.status = deriveCustomerProductStatus(agreement);
    db.customerProducts.push(agreement);
    return clone(agreement);
  },

  async updateCustomerProduct(id: string, patch: UpdateCustomerProductPayload) {
    const agreement = db.customerProducts.find((item) => item.id === id);
    if (!agreement) throw new Error("Customer pricing agreement not found");

    Object.assign(agreement, patch);
    if (patch.startDate !== undefined) {
      agreement.startDate = patch.startDate ? toIsoString(patch.startDate) : null;
    }
    if (patch.endDate !== undefined) {
      agreement.endDate = patch.endDate ? toIsoString(patch.endDate) : null;
    }

    agreement.status = deriveCustomerProductStatus(agreement);
    return clone(agreement);
  },

  async listSuppliers() {
    return clone(sortByName(db.suppliers));
  },

  async getSupplierById(id: string) {
    const supplier = db.suppliers.find((item) => item.id === id);
    if (!supplier) throw new Error("Supplier not found");
    return clone(supplier);
  },

  async listSupplierPurchaseOrders(filters?: SupplierPurchaseOrderFilters) {
    const needle = filters?.query?.toLowerCase().trim();
    const supplierLookup = new Map(db.suppliers.map((supplier) => [supplier.id, supplier]));

    let results = db.supplierPurchaseOrders.slice();

    if (filters?.supplierId) {
      results = results.filter((item) => item.supplierId === filters.supplierId);
    }

    if (filters?.status) {
      results = results.filter((item) => item.status === filters.status);
    }

    if (needle) {
      results = results.filter((purchaseOrder) =>
        matchesText(
          needle,
          purchaseOrder.poNumber,
          purchaseOrder.notes,
          supplierLookup.get(purchaseOrder.supplierId)?.name,
        ),
      );
    }

    results.sort(
      (left, right) =>
        new Date(right.orderDate).getTime() - new Date(left.orderDate).getTime(),
    );

    return clone(results);
  },

  async getSupplierPurchaseOrderById(id: string) {
    const purchaseOrder = db.supplierPurchaseOrders.find((item) => item.id === id);
    if (!purchaseOrder) throw new Error("Supplier purchase order not found");
    return clone(purchaseOrder);
  },

  async listSupplierPurchaseOrderItems(purchaseOrderId?: string) {
    const items = purchaseOrderId
      ? db.supplierPurchaseOrderItems.filter(
          (item) => item.purchaseOrderId === purchaseOrderId,
        )
      : db.supplierPurchaseOrderItems;

    return clone(items);
  },

  async listOrders(filters?: OrderFilters) {
    const needle = filters?.query?.toLowerCase().trim();
    const customerLookup = new Map(db.customers.map((customer) => [customer.id, customer]));

    let results = db.orders.slice();

    if (filters?.status) {
      results = results.filter((order) => order.status === filters.status);
    }

    if (filters?.customerId) {
      results = results.filter((order) => order.customerId === filters.customerId);
    }

    if (filters?.delayedOnly) {
      const now = Date.now();
      results = results.filter((order) => {
        if (!order.promisedEta) return false;
        if (order.status === "delivered" || order.status === "cancelled") return false;
        return new Date(order.promisedEta).getTime() < now;
      });
    }

    if (needle) {
      results = results.filter((order) =>
        matchesText(
          needle,
          order.orderNumber,
          order.notes,
          customerLookup.get(order.customerId)?.name,
        ),
      );
    }

    results.sort(
      (left, right) => new Date(right.orderDate).getTime() - new Date(left.orderDate).getTime(),
    );

    return clone(results);
  },

  async getOrderById(id: string) {
    const order = db.orders.find((item) => item.id === id);
    if (!order) throw new Error("Order not found");
    return clone(order);
  },

  async addOrder(payload: CreateOrderPayload) {
    const customer = db.customers.find((item) => item.id === payload.customerId);
    if (!customer) throw new Error("Customer not found");

    const orderId = createId("ord");
    const orderDate = toIsoString(payload.orderDate, new Date().toISOString()) ?? new Date().toISOString();
    const status = toOrderStatus(payload.status);
    const planningState = buildPlanningState();
    const reservation = emptyReservationEntry();
    const materialDates: Array<string | null> = [];

    payload.items.forEach((item) => {
      const result =
        item.itemType === "product"
          ? planProductMaterials(item.itemId, item.quantity, planningState, orderDate)
          : planComponentMaterials(item.itemId, item.quantity, planningState, orderDate);

      materialDates.push(result.materialAvailabilityEta);
      mergeReservationEntries(reservation, result.reservation);
    });

    const orderItems = payload.items.map((item, index) =>
      buildOrderItemSnapshot(item, customer.id, orderDate, orderId, index),
    );
    const totals = summarizeOrderItems(orderItems);
    const orderProductionSteps = buildProductionSteps(orderId, payload.productionSteps);
    const etas = deriveOrderEtas(
      db.businessSettings,
      getLatestEta(materialDates),
      orderProductionSteps,
      payload.deliveryLeadDays,
    );

    const order: Order = {
      id: orderId,
      orderNumber: createOrderNumber(),
      customerId: customer.id,
      orderDate,
      status,
      currency: "NOK",
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      costTotal: totals.costTotal,
      profitTotal: totals.profitTotal,
      grandTotal: totals.grandTotal,
      itemCount: totals.itemCount,
      materialAvailabilityEta: etas.materialAvailabilityEta,
      productionCompletionEta: etas.productionCompletionEta,
      deliveryEta: etas.deliveryEta,
      promisedEta: etas.promisedEta,
      deliveryLeadDays: payload.deliveryLeadDays,
      notes: payload.notes?.trim() ?? "",
    };

    db.orders.push(order);
    db.orderItems.push(...orderItems);
    db.orderProductionSteps.push(...orderProductionSteps);

    if (isReservationStatus(status)) {
      applyReservationEntry(order.id, reservation);
    }

    return clone(order);
  },

  async updateOrder(id: string, patch: UpdateOrderPayload) {
    const order = db.orders.find((item) => item.id === id);
    if (!order) throw new Error("Order not found");

    releaseReservationEntry(id);

    order.status = patch.status ? toOrderStatus(patch.status) : order.status;
    order.orderDate = patch.orderDate
      ? toIsoString(patch.orderDate, order.orderDate) ?? order.orderDate
      : order.orderDate;
    order.deliveryLeadDays =
      patch.deliveryLeadDays !== undefined
        ? toNumber(patch.deliveryLeadDays, order.deliveryLeadDays)
        : order.deliveryLeadDays;
    order.notes = patch.notes !== undefined ? String(patch.notes ?? "") : order.notes;

    const etas = recomputeOrder(id, {
      status: order.status,
      orderDate: order.orderDate,
      deliveryLeadDays: order.deliveryLeadDays,
    });

    order.materialAvailabilityEta = etas.materialAvailabilityEta;
    order.productionCompletionEta = etas.productionCompletionEta;
    order.deliveryEta = etas.deliveryEta;
    order.promisedEta = etas.promisedEta;

    return clone(order);
  },

  async removeOrder(id: string) {
    releaseReservationEntry(id);
    db.orders = db.orders.filter((item) => item.id !== id);
    db.orderItems = db.orderItems.filter((item) => item.orderId !== id);
    db.orderProductionSteps = db.orderProductionSteps.filter(
      (item) => item.orderId !== id,
    );
  },

  async listOrderItems(orderId?: string) {
    const items = orderId
      ? db.orderItems.filter((item) => item.orderId === orderId)
      : db.orderItems;

    return clone(items);
  },

  async addOrderItem(payload: CreateOrderItemPayload) {
    db.orderItems.push(payload);

    const order = db.orders.find((item) => item.id === payload.orderId);
    if (order) {
      const totals = summarizeOrderItems(
        db.orderItems.filter((item) => item.orderId === payload.orderId),
      );
      order.subtotal = totals.subtotal;
      order.discountTotal = totals.discountTotal;
      order.costTotal = totals.costTotal;
      order.profitTotal = totals.profitTotal;
      order.grandTotal = totals.grandTotal;
      order.itemCount = totals.itemCount;
    }

    return clone(payload);
  },

  async removeOrderItem(id: string) {
    const target = db.orderItems.find((item) => item.id === id);
    if (!target) return;

    db.orderItems = db.orderItems.filter((item) => item.id !== id);

    const order = db.orders.find((item) => item.id === target.orderId);
    if (order) {
      const totals = summarizeOrderItems(
        db.orderItems.filter((item) => item.orderId === target.orderId),
      );
      order.subtotal = totals.subtotal;
      order.discountTotal = totals.discountTotal;
      order.costTotal = totals.costTotal;
      order.profitTotal = totals.profitTotal;
      order.grandTotal = totals.grandTotal;
      order.itemCount = totals.itemCount;
    }
  },

  async listOrderProductionSteps(orderId?: string) {
    const steps = orderId
      ? db.orderProductionSteps.filter((item) => item.orderId === orderId)
      : db.orderProductionSteps;
    return clone(steps);
  },

  async addOrderProductionStep(step: Omit<OrderProductionStep, "id"> & { id?: string }) {
    const record: OrderProductionStep = {
      ...step,
      id: step.id ?? createId("ops"),
    };
    db.orderProductionSteps.push(record);
    return clone(record);
  },

  async updateOrderProductionStep(id: string, patch: Partial<OrderProductionStep>) {
    const step = db.orderProductionSteps.find((item) => item.id === id);
    if (!step) throw new Error("Order production step not found");

    Object.assign(step, patch);
    return clone(step);
  },

  async removeOrderProductionStep(id: string) {
    db.orderProductionSteps = db.orderProductionSteps.filter((item) => item.id !== id);
  },

  async listWorkCenters() {
    return clone(sortByName(db.workCenters));
  },

  async listUsers() {
    return clone(db.users);
  },

  findUser(username: string) {
    return db.users.find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  },
};
