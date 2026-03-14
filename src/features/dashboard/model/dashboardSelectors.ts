import type { Customer, Order, OrderItem, Product } from "@/shared/types/domain";

export interface DashboardMetrics {
  totalSales: number;
  totalOrders: number;
  estimatedProfit: number;
  lowStockCount: number;
  activeCustomers: number;
}

export interface TopCustomer {
  customerId: string;
  companyName: string;
  totalSales: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  revenue: number;
}

export const getDashboardMetrics = (
  orders: Order[],
  products: Product[],
  customers: Customer[],
): DashboardMetrics => ({
  totalSales: orders.reduce((sum, order) => sum + order.totalAmount, 0),
  totalOrders: orders.length,
  estimatedProfit: orders.reduce((sum, order) => sum + order.estimatedProfit, 0),
  lowStockCount: products.filter((product) => product.stockQuantity <= product.reorderLevel).length,
  activeCustomers: customers.filter((customer) => customer.status === "active").length,
});

export const getTopCustomers = (orders: Order[], customers: Customer[], limit = 5): TopCustomer[] => {
  const customerLookup = new Map(customers.map((customer) => [customer.id, customer]));
  const totals = new Map<string, number>();

  orders.forEach((order) => {
    totals.set(order.customerId, (totals.get(order.customerId) ?? 0) + order.totalAmount);
  });

  return [...totals.entries()]
    .map(([customerId, totalSales]) => ({
      customerId,
      companyName: customerLookup.get(customerId)?.companyName ?? "Unknown",
      totalSales,
    }))
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, limit);
};

export const getTopProducts = (
  orderItems: OrderItem[],
  products: Product[],
  limit = 5,
): TopProduct[] => {
  const productLookup = new Map(products.map((product) => [product.id, product]));
  const totals = new Map<string, number>();

  orderItems.forEach((item) => {
    totals.set(item.productId, (totals.get(item.productId) ?? 0) + item.lineTotal);
  });

  return [...totals.entries()]
    .map(([productId, revenue]) => ({
      productId,
      name: productLookup.get(productId)?.name ?? "Unknown",
      revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
};
