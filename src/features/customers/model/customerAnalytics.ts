import type { Customer, CustomerProduct, Order, OrderItem } from "@/shared/types/domain";
import { toFixed2 } from "@/shared/lib/format";

export interface CustomerDirectoryRow extends Customer {
  region: string;
  orderCount: number;
  revenue: number;
  profit: number;
  itemsPurchased: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
}

export interface CustomerOrderHistoryRow extends Order {
  itemQuantity: number;
}

export interface CustomerDetailMetrics {
  totalOrders: number;
  lifetimeRevenue: number;
  estimatedProfit: number;
  itemsPurchased: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
  activePricingAgreements: number;
}

export const getCustomerRegion = (address: string) => {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.at(-1) ?? address.trim() ?? "Unknown";
};

export const buildCustomerDirectoryRows = (
  customers: Customer[],
  orders: Order[],
  orderItems: OrderItem[],
) => {
  const orderLookup = new Map<string, Order[]>();
  const itemCountLookup = new Map<string, number>();

  orders.forEach((order) => {
    const current = orderLookup.get(order.customerId) ?? [];
    current.push(order);
    orderLookup.set(order.customerId, current);
  });

  orderItems.forEach((item) => {
    const order = orders.find((entry) => entry.id === item.orderId);
    if (!order) return;
    itemCountLookup.set(
      order.customerId,
      (itemCountLookup.get(order.customerId) ?? 0) + item.quantity,
    );
  });

  return customers
    .map<CustomerDirectoryRow>((customer) => {
      const customerOrders = (orderLookup.get(customer.id) ?? []).slice().sort(
        (left, right) =>
          new Date(right.orderDate).getTime() - new Date(left.orderDate).getTime(),
      );

      const revenue = toFixed2(
        customerOrders.reduce((sum, order) => sum + order.grandTotal, 0),
      );
      const profit = toFixed2(
        customerOrders.reduce((sum, order) => sum + order.profitTotal, 0),
      );
      const orderCount = customerOrders.length;
      const itemsPurchased = itemCountLookup.get(customer.id) ?? 0;
      const averageOrderValue = orderCount > 0 ? toFixed2(revenue / orderCount) : 0;

      return {
        ...customer,
        region: getCustomerRegion(customer.address),
        orderCount,
        revenue,
        profit,
        itemsPurchased,
        averageOrderValue,
        lastOrderDate: customerOrders[0]?.orderDate ?? null,
      };
    })
    .sort((left, right) => right.revenue - left.revenue);
};

export const buildCustomerDetailMetrics = (
  orders: Order[],
  orderItems: OrderItem[],
  pricingAgreements: CustomerProduct[],
): CustomerDetailMetrics => {
  const totalOrders = orders.length;
  const lifetimeRevenue = toFixed2(
    orders.reduce((sum, order) => sum + order.grandTotal, 0),
  );
  const estimatedProfit = toFixed2(
    orders.reduce((sum, order) => sum + order.profitTotal, 0),
  );
  const itemsPurchased = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const averageOrderValue = totalOrders > 0 ? toFixed2(lifetimeRevenue / totalOrders) : 0;
  const lastOrderDate = orders
    .slice()
    .sort((left, right) => new Date(right.orderDate).getTime() - new Date(left.orderDate).getTime())[0]
    ?.orderDate ?? null;

  return {
    totalOrders,
    lifetimeRevenue,
    estimatedProfit,
    itemsPurchased,
    averageOrderValue,
    lastOrderDate,
    activePricingAgreements: pricingAgreements.filter((agreement) => agreement.status === "active")
      .length,
  };
};

export const buildOrderHistoryRows = (orders: Order[], orderItems: OrderItem[]) => {
  const quantityLookup = new Map<string, number>();

  orderItems.forEach((item) => {
    quantityLookup.set(item.orderId, (quantityLookup.get(item.orderId) ?? 0) + item.quantity);
  });

  return orders
    .slice()
    .sort((left, right) => new Date(right.orderDate).getTime() - new Date(left.orderDate).getTime())
    .map<CustomerOrderHistoryRow>((order) => ({
      ...order,
      itemQuantity: quantityLookup.get(order.id) ?? order.itemCount,
    }));
};
