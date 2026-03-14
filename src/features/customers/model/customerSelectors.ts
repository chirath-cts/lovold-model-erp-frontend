import type { Customer, Order } from "@/shared/types/domain";

export interface CustomerAggregate {
  customerId: string;
  totalOrders: number;
  totalSales: number;
  lastOrderDate?: string;
}

export const buildCustomerAggregates = (customers: Customer[], orders: Order[]): CustomerAggregate[] => {
  const map = new Map<string, CustomerAggregate>();

  customers.forEach((customer) => {
    map.set(customer.id, {
      customerId: customer.id,
      totalOrders: 0,
      totalSales: 0,
    });
  });

  orders.forEach((order) => {
    const current = map.get(order.customerId);
    if (!current) return;

    const nextDate =
      !current.lastOrderDate || new Date(order.orderDate).getTime() > new Date(current.lastOrderDate).getTime()
        ? order.orderDate
        : current.lastOrderDate;

    map.set(order.customerId, {
      customerId: order.customerId,
      totalOrders: current.totalOrders + 1,
      totalSales: current.totalSales + order.totalAmount,
      lastOrderDate: nextDate,
    });
  });

  return [...map.values()];
};
