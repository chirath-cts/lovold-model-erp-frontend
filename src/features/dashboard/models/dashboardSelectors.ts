import { getAvailableQuantity } from "@/features/inventory/shared/catalogHelpers";
import type {
  Component,
  ComponentProduct,
  Customer,
  Order,
  OrderItem,
  Product,
  Supplier,
  SupplierPurchaseOrder,
  SupplierPurchaseOrderItem,
} from "@/shared/types/domain";

const activeOrderStatuses = new Set([
  "confirmed",
  "reserved",
  "in_production",
  "ready",
  "dispatched",
]);

const activeInboundStatuses = new Set(["ordered", "partially_received"]);

const differenceInDays = (value: string | null, now: Date) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export interface DashboardKpis {
  totalSales: number;
  totalOrders: number;
  estimatedProfit: number;
  delayedOrders: number;
  ordersInProduction: number;
  ordersAwaitingMaterials: number;
  activeCustomers: number;
  inboundDueSoon: number;
}

export interface DashboardOrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  status: Order["status"];
  orderDate: string;
  grandTotal: number;
  promisedEta: string | null;
  materialAvailabilityEta: string | null;
  deliveryEta: string | null;
  isDelayed: boolean;
  daysFromPromise: number | null;
}

export interface DashboardInboundRow {
  id: string;
  poNumber: string;
  supplierName: string;
  status: SupplierPurchaseOrder["status"];
  eta: string | null;
  orderDate: string;
  remainingUnits: number;
  lineCount: number;
}

export interface DashboardInventoryRow {
  id: string;
  type: "product" | "component";
  name: string;
  sku: string;
  availableQuantity: number;
  reservedQuantity: number;
  stockQuantity: number;
  supporting: string;
}

export interface DashboardComponentRiskRow {
  componentId: string;
  name: string;
  sku: string;
  availableQuantity: number;
  blockedProducts: Array<{
    productName: string;
    missingQuantity: number;
  }>;
}

export interface DashboardRankRow {
  id: string;
  name: string;
  supporting: string;
  value: number;
}

export interface DashboardStatusRow {
  status: Order["status"];
  count: number;
}

export interface DashboardViewModel {
  kpis: DashboardKpis;
  delayedOrders: DashboardOrderRow[];
  etaRiskOrders: DashboardOrderRow[];
  recentOrders: DashboardOrderRow[];
  upcomingInbound: DashboardInboundRow[];
  lowAvailableStock: DashboardInventoryRow[];
  highReservedStock: DashboardInventoryRow[];
  componentShortageRisks: DashboardComponentRiskRow[];
  topCustomers: DashboardRankRow[];
  topSellableItems: DashboardRankRow[];
  orderStatusDistribution: DashboardStatusRow[];
}

const dashboardStatusOrder: Order["status"][] = [
  "draft",
  "confirmed",
  "reserved",
  "in_production",
  "ready",
  "dispatched",
  "delivered",
  "cancelled",
];

export const buildDashboardViewModel = ({
  orders,
  orderItems,
  products,
  components,
  componentProducts,
  customers,
  supplierPurchaseOrders,
  supplierPurchaseOrderItems,
  suppliers,
}: {
  orders: Order[];
  orderItems: OrderItem[];
  products: Product[];
  components: Component[];
  componentProducts: ComponentProduct[];
  customers: Customer[];
  supplierPurchaseOrders: SupplierPurchaseOrder[];
  supplierPurchaseOrderItems: SupplierPurchaseOrderItem[];
  suppliers: Supplier[];
}): DashboardViewModel => {
  const now = new Date();
  const customerLookup = new Map(customers.map((customer) => [customer.id, customer]));
  const supplierLookup = new Map(suppliers.map((supplier) => [supplier.id, supplier]));
  const productLookup = new Map(products.map((product) => [product.id, product]));
  const componentLookup = new Map(components.map((component) => [component.id, component]));

  const activeOrders = orders.filter(
    (order) => order.status !== "delivered" && order.status !== "cancelled",
  );

  const orderRows: DashboardOrderRow[] = activeOrders
    .map((order) => {
      const promiseDate = order.promisedEta ? new Date(order.promisedEta) : null;
      const isDelayed = Boolean(
        promiseDate && promiseDate.getTime() < now.getTime(),
      );

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: customerLookup.get(order.customerId)?.name ?? "Unknown customer",
        status: order.status,
        orderDate: order.orderDate,
        grandTotal: order.grandTotal,
        promisedEta: order.promisedEta,
        materialAvailabilityEta: order.materialAvailabilityEta,
        deliveryEta: order.deliveryEta,
        isDelayed,
        daysFromPromise: differenceInDays(order.promisedEta, now),
      };
    })
    .sort(
      (left, right) =>
        new Date(left.orderDate).getTime() - new Date(right.orderDate).getTime(),
    );

  const delayedOrders = orderRows
    .filter((order) => order.isDelayed)
    .sort((left, right) => {
      const leftValue = left.daysFromPromise ?? 0;
      const rightValue = right.daysFromPromise ?? 0;
      return leftValue - rightValue;
    })
    .slice(0, 5);

  const etaRiskOrders = orderRows
    .filter((order) => {
      if (order.isDelayed || !order.promisedEta) return false;
      const daysUntilPromise = order.daysFromPromise;
      return (
        daysUntilPromise !== null &&
        daysUntilPromise <= 10 &&
        (order.status === "confirmed" ||
          order.status === "reserved" ||
          order.status === "in_production" ||
          order.status === "ready")
      );
    })
    .sort((left, right) => {
      const leftValue = left.daysFromPromise ?? Number.MAX_SAFE_INTEGER;
      const rightValue = right.daysFromPromise ?? Number.MAX_SAFE_INTEGER;
      return leftValue - rightValue;
    })
    .slice(0, 5);

  const recentOrders = orderRows
    .slice()
    .sort(
      (left, right) =>
        new Date(right.orderDate).getTime() - new Date(left.orderDate).getTime(),
    )
    .slice(0, 6);

  const purchaseOrderItemsByHeader = supplierPurchaseOrderItems.reduce<
    Map<string, SupplierPurchaseOrderItem[]>
  >((map, item) => {
    const current = map.get(item.purchaseOrderId) ?? [];
    current.push(item);
    map.set(item.purchaseOrderId, current);
    return map;
  }, new Map());

  const upcomingInbound = supplierPurchaseOrders
    .filter((purchaseOrder) => activeInboundStatuses.has(purchaseOrder.status))
    .map((purchaseOrder) => {
      const items = purchaseOrderItemsByHeader.get(purchaseOrder.id) ?? [];
      return {
        id: purchaseOrder.id,
        poNumber: purchaseOrder.poNumber,
        supplierName:
          supplierLookup.get(purchaseOrder.supplierId)?.name ?? "Unknown supplier",
        status: purchaseOrder.status,
        eta: purchaseOrder.eta,
        orderDate: purchaseOrder.orderDate,
        remainingUnits: items.reduce(
          (sum, item) => sum + item.remainingQuantity,
          0,
        ),
        lineCount: items.length,
      };
    })
    .sort((left, right) => {
      const leftTime = left.eta ? new Date(left.eta).getTime() : Number.MAX_SAFE_INTEGER;
      const rightTime = right.eta
        ? new Date(right.eta).getTime()
        : Number.MAX_SAFE_INTEGER;
      return leftTime - rightTime;
    })
    .slice(0, 5);

  const lowAvailableStock = products
    .map((product) => ({
      id: product.id,
      type: "product" as const,
      name: product.name,
      sku: product.sku,
      availableQuantity: getAvailableQuantity(
        product.stockQuantity,
        product.reservedQuantity,
      ),
      reservedQuantity: product.reservedQuantity,
      stockQuantity: product.stockQuantity,
      supporting: `Reorder level ${product.reorderLevel} ${product.unit}`,
      reorderLevel: product.reorderLevel,
    }))
    .filter((product) => product.availableQuantity <= product.reorderLevel)
    .sort(
      (left, right) =>
        left.availableQuantity - right.availableQuantity ||
        right.reservedQuantity - left.reservedQuantity,
    )
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      type: item.type,
      name: item.name,
      sku: item.sku,
      availableQuantity: item.availableQuantity,
      reservedQuantity: item.reservedQuantity,
      stockQuantity: item.stockQuantity,
      supporting: item.supporting,
    }));

  const highReservedStock = [
    ...products.map((product) => ({
      id: product.id,
      type: "product" as const,
      name: product.name,
      sku: product.sku,
      availableQuantity: getAvailableQuantity(
        product.stockQuantity,
        product.reservedQuantity,
      ),
      reservedQuantity: product.reservedQuantity,
      stockQuantity: product.stockQuantity,
      supporting: `${product.unit} inventory`,
      ratio:
        product.stockQuantity > 0
          ? product.reservedQuantity / product.stockQuantity
          : product.reservedQuantity > 0
            ? 1
            : 0,
    })),
    ...components.map((component) => ({
      id: component.id,
      type: "component" as const,
      name: component.name,
      sku: component.sku,
      availableQuantity: getAvailableQuantity(
        component.stockQuantity,
        component.reservedQuantity,
      ),
      reservedQuantity: component.reservedQuantity,
      stockQuantity: component.stockQuantity,
      supporting: `${component.unit} ready-made stock`,
      ratio:
        component.stockQuantity > 0
          ? component.reservedQuantity / component.stockQuantity
          : component.reservedQuantity > 0
            ? 1
            : 0,
    })),
  ]
    .filter((item) => item.reservedQuantity > 0)
    .sort(
      (left, right) =>
        right.ratio - left.ratio || right.reservedQuantity - left.reservedQuantity,
    )
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      type: item.type,
      name: item.name,
      sku: item.sku,
      availableQuantity: item.availableQuantity,
      reservedQuantity: item.reservedQuantity,
      stockQuantity: item.stockQuantity,
      supporting: item.supporting,
    }));

  const componentProductsByComponent = componentProducts.reduce<
    Map<string, ComponentProduct[]>
  >((map, row) => {
    const current = map.get(row.componentId) ?? [];
    current.push(row);
    map.set(row.componentId, current);
    return map;
  }, new Map());

  const componentShortageRisks = components
    .map((component) => {
      const availableQuantity = getAvailableQuantity(
        component.stockQuantity,
        component.reservedQuantity,
      );
      const blockedProducts = (componentProductsByComponent.get(component.id) ?? [])
        .map((row) => {
          const product = productLookup.get(row.productId);
          const availableProductQuantity = product
            ? getAvailableQuantity(product.stockQuantity, product.reservedQuantity)
            : 0;

          return {
            productName: product?.name ?? "Unknown product",
            missingQuantity: Math.max(row.quantity - availableProductQuantity, 0),
          };
        })
        .filter((row) => row.missingQuantity > 0);

      return {
        componentId: component.id,
        name: component.name,
        sku: component.sku,
        availableQuantity,
        blockedProducts,
      };
    })
    .filter((item) => item.availableQuantity <= 1 && item.blockedProducts.length > 0)
    .sort(
      (left, right) =>
        left.availableQuantity - right.availableQuantity ||
        right.blockedProducts.length - left.blockedProducts.length,
    )
    .slice(0, 4);

  const topCustomers = [...orders.reduce<Map<string, number>>((map, order) => {
    map.set(order.customerId, (map.get(order.customerId) ?? 0) + order.grandTotal);
    return map;
  }, new Map()).entries()]
    .map(([customerId, value]) => ({
      id: customerId,
      name: customerLookup.get(customerId)?.name ?? "Unknown customer",
      supporting:
        customerLookup.get(customerId)?.address ?? customerLookup.get(customerId)?.email ?? "",
      value,
    }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 5);

  const topSellableItems = [...orderItems.reduce<Map<string, number>>((map, item) => {
    const key = `${item.itemType}:${item.itemId}`;
    map.set(key, (map.get(key) ?? 0) + item.lineTotal);
    return map;
  }, new Map()).entries()]
    .map(([key, value]) => {
      const [itemType, itemId] = key.split(":");
      const source =
        itemType === "component"
          ? componentLookup.get(itemId)
          : productLookup.get(itemId);

      return {
        id: key,
        name: source?.name ?? "Unknown item",
        supporting: `${itemType === "component" ? "Component" : "Product"} • ${source?.sku ?? "Unknown SKU"}`,
        value,
      };
    })
    .sort((left, right) => right.value - left.value)
    .slice(0, 5);

  const orderStatusDistribution: DashboardStatusRow[] = dashboardStatusOrder.map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }));

  return {
    kpis: {
      totalSales: orders.reduce((sum, order) => sum + order.grandTotal, 0),
      totalOrders: orders.length,
      estimatedProfit: orders.reduce((sum, order) => sum + order.profitTotal, 0),
      delayedOrders: delayedOrders.length,
      ordersInProduction: orders.filter((order) => order.status === "in_production")
        .length,
      ordersAwaitingMaterials: orders.filter(
        (order) =>
          activeOrderStatuses.has(order.status) &&
          (order.status === "confirmed" || order.status === "reserved") &&
          Boolean(order.materialAvailabilityEta) &&
          new Date(order.materialAvailabilityEta as string).getTime() > now.getTime(),
      ).length,
      activeCustomers: customers.filter((customer) => customer.status === "active")
        .length,
      inboundDueSoon: supplierPurchaseOrders.filter((purchaseOrder) => {
        if (!activeInboundStatuses.has(purchaseOrder.status)) return false;
        const daysUntilEta = differenceInDays(purchaseOrder.eta, now);
        return daysUntilEta !== null && daysUntilEta <= 14;
      }).length,
    },
    delayedOrders,
    etaRiskOrders,
    recentOrders,
    upcomingInbound,
    lowAvailableStock,
    highReservedStock,
    componentShortageRisks,
    topCustomers,
    topSellableItems,
    orderStatusDistribution,
  };
};
