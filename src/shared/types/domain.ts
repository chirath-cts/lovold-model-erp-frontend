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
  unitPrice: number;
  fixedCostPrice: number;
  currency: "NOK";
  unit: string;
  stockQuantity: number;
  reorderLevel: number;
  description: string;
  status: EntityStatus;
}

export interface Customer {
  id: string;
  customerCode: string;
  companyName: string;
  contactPerson: string;
  country: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: EntityStatus;
  createdAt: string;
}

export type DiscountScopeType = "product" | "category";
export type DiscountType = "percentage" | "fixed";
export type DiscountStatus = "active" | "future" | "expired";

export interface Discount {
  id: string;
  name: string;
  customerId: string;
  scopeType: DiscountScopeType;
  scopeId: string;
  discountType: DiscountType;
  value: number;
  currency: "NOK";
  startDate: string;
  endDate: string;
  status: DiscountStatus;
}

export type OrderStatus = "draft" | "confirmed" | "dispatched" | "delivered";

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  orderDate: string;
  status: OrderStatus;
  currency: "NOK";
  totalAmount: number;
  totalDiscount: number;
  totalCost: number;
  estimatedProfit: number;
  itemCount: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productSku: string;
  productNameSnapshot: string;
  quantity: number;
  unit: string;
  currency: "NOK";
  sellingPriceSnapshot: number;
  fixedCostSnapshot: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  lineSubtotal: number;
  lineTotal: number;
  lineProfit: number;
}

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
