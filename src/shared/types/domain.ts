export type EntityStatus = "active" | "inactive";

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  imageUrl?: string | null;
  basePrice: number;
  purchasePrice: number;
  unit: string;
  stockQuantity: number;
  reorderLevel: number;
  description: string;
  status: EntityStatus;
}

export interface Customer {
  id: string;
  customerCode: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: EntityStatus;
}

export type DiscountType = "percentage" | "fixed";
export type CustomerProductStatus = "active" | "future" | "expired";

export interface CustomerProduct {
  customerId: string;
  productId: string;
  discountPercent: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  status: CustomerProductStatus;
}

export type OrderStatus = "draft" | "confirmed" | "dispatched" | "delivered";

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  orderDate: string;
  status: OrderStatus;
  currency: "NOK";
  subtotal: number;
  discountTotal: number;
  costTotal: number;
  profitTotal: number;
  grandTotal: number;
  itemCount: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineSubtotal: number;
  discountPercent: number;
  discountAmount: number;
  lineTotal: number;
  unitCostAtSale: number;
  profitAmount: number;
  productSku: string | null;
  productName: string | null;
  productUnit: string | null;
}

export type CreateOrderPayload = Omit<Order, "itemCount">;
export type UpdateOrderPayload = Partial<CreateOrderPayload>;
export type CreateCustomerProductPayload = Omit<CustomerProduct, "status">;
export type UpdateCustomerProductPayload = Partial<CreateCustomerProductPayload>;

export type CreateOrderItemPayload = Omit<
  OrderItem,
  "productSku" | "productName" | "productUnit"
>;

export interface User {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: EntityStatus;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: EntityStatus;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
}

export interface WarehouseProduct {
  id: string;
  warehouseId: string;
  productId: string;
  supplierId: string;
  stockQuantity: number;
  reorderLevel: number;
  supplierPrice: number;
  supplierDiscount: number;
}
