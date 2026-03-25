import { toFixed2 } from "@/shared/lib/format";
import type { Customer, Order, OrderItem, OrderStatus } from "@/shared/types/domain";

export interface CustomerSummaryMetrics {
  orderCount: number;
  revenue: number;
  profit: number;
  itemQuantity: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
  delayedOrders: number;
}

export interface CustomerItemMetrics {
  itemType: "product" | "component";
  itemId: string;
  itemName: string;
  itemSku: string;
  quantity: number;
  revenue: number;
  profit: number;
}

const nonTerminalStatuses = new Set<OrderStatus>([
  "draft",
  "confirmed",
  "reserved",
  "in_production",
  "ready",
  "dispatched",
]);

export const getCustomerRegion = (address: string) => {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return "Unassigned";
  return parts[parts.length - 1];
};

export const formatDateLabel = (value: string | null | undefined) => {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const isDelayedCustomerOrder = (order: Order) => {
  if (!order.promisedEta) return false;
  if (!nonTerminalStatuses.has(order.status)) return false;
  return new Date(order.promisedEta).getTime() < Date.now();
};

export const getCustomerSummaryMetrics = (
  orders: Order[],
  orderItems: OrderItem[],
): CustomerSummaryMetrics => {
  const orderIds = new Set(orders.map((order) => order.id));
  const items = orderItems.filter((item) => orderIds.has(item.orderId));

  const revenue = toFixed2(orders.reduce((sum, order) => sum + order.grandTotal, 0));
  const profit = toFixed2(orders.reduce((sum, order) => sum + order.profitTotal, 0));
  const itemQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const lastOrderDate = orders.reduce<string | null>((latest, order) => {
    if (!latest) return order.orderDate;
    return new Date(order.orderDate).getTime() > new Date(latest).getTime()
      ? order.orderDate
      : latest;
  }, null);

  const delayedOrders = orders.filter(isDelayedCustomerOrder).length;

  return {
    orderCount: orders.length,
    revenue,
    profit,
    itemQuantity,
    averageOrderValue: orders.length > 0 ? toFixed2(revenue / orders.length) : 0,
    lastOrderDate,
    delayedOrders,
  };
};

export const getCustomerItemMetrics = (
  orders: Order[],
  orderItems: OrderItem[],
  limit = 6,
): CustomerItemMetrics[] => {
  const orderIds = new Set(orders.map((order) => order.id));
  const grouped = new Map<string, CustomerItemMetrics>();

  orderItems.forEach((item) => {
    if (!orderIds.has(item.orderId)) return;

    const existing = grouped.get(item.itemId);
    if (existing) {
      existing.quantity += item.quantity;
      existing.revenue = toFixed2(existing.revenue + item.lineTotal);
      existing.profit = toFixed2(existing.profit + item.profitAmount);
      return;
    }

    grouped.set(item.itemId, {
      itemType: item.itemType,
      itemId: item.itemId,
      itemName: item.itemName,
      itemSku: item.itemSku,
      quantity: item.quantity,
      revenue: toFixed2(item.lineTotal),
      profit: toFixed2(item.profitAmount),
    });
  });

  return Array.from(grouped.values())
    .sort((left, right) => {
      if (right.quantity !== left.quantity) return right.quantity - left.quantity;
      return right.revenue - left.revenue;
    })
    .slice(0, limit);
};

export const getCustomerSearchTokens = (customer: Customer) =>
  [customer.customerCode, customer.name, customer.email, customer.phone, customer.address]
    .join(" ")
    .toLowerCase();
