export type EntityStatus = "active" | "inactive";
export type DiscountType = "percentage" | "fixed";

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
  reservedQuantity: number;
  reorderLevel: number;
  description: string;
  status: EntityStatus;
}

export interface Component {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  imageUrl?: string | null;
  description: string;
  unit: string;
  stockQuantity: number;
  reservedQuantity: number;
  standardProductionCost: number;
  status: EntityStatus;
}

export interface ComponentProduct {
  id: string;
  componentId: string;
  productId: string;
  quantity: number;
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

export type CustomerProductStatus = "active" | "future" | "expired";

export interface CustomerProduct {
  id: string;
  customerId: string;
  productId: string;
  discountPercent: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  status: CustomerProductStatus;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: EntityStatus;
}

export type SupplierPurchaseOrderStatus =
  | "draft"
  | "ordered"
  | "partially_received"
  | "received"
  | "cancelled";

export interface SupplierPurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  orderDate: string;
  eta: string | null;
  status: SupplierPurchaseOrderStatus;
  notes?: string;
}

export interface SupplierPurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  orderedQuantity: number;
  receivedQuantity: number;
  remainingQuantity: number;
  unitCost: number;
}

export type OrderStatus =
  | "draft"
  | "confirmed"
  | "reserved"
  | "in_production"
  | "ready"
  | "dispatched"
  | "delivered"
  | "cancelled";

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
  materialAvailabilityEta: string | null;
  productionCompletionEta: string | null;
  deliveryEta: string | null;
  promisedEta: string | null;
  deliveryLeadDays: number;
  notes?: string;
}

export type OrderItemType = "product" | "component";

export interface OrderItem {
  id: string;
  orderId: string;
  itemType: OrderItemType;
  itemId: string;
  itemName: string;
  itemSku: string;
  itemUnit: string;
  quantity: number;
  unitPrice: number;
  lineSubtotal: number;
  discountPercent: number;
  discountAmount: number;
  lineTotal: number;
  unitCostAtSale: number;
  profitAmount: number;
}

export type OrderProductionStepStatus = "pending" | "in_progress" | "completed";

export interface OrderProductionStep {
  id: string;
  orderId: string;
  workCenterId: string;
  stepName: string;
  description?: string;
  cost: number;
  timeHours: number;
  status?: OrderProductionStepStatus;
}

export interface WorkCenter {
  id: string;
  name: string;
  description?: string;
}

export interface BusinessSettings {
  qualityCheckLeadDays: number;
  packagingLeadDays: number;
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

export interface CreateProductPayload extends Omit<Product, "reservedQuantity"> {
  reservedQuantity?: number;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface CreateComponentPayload extends Omit<Component, "reservedQuantity"> {
  reservedQuantity?: number;
}

export type UpdateComponentPayload = Partial<CreateComponentPayload>;

export type CreateCustomerProductPayload = Omit<CustomerProduct, "status">;
export type UpdateCustomerProductPayload = Partial<CreateCustomerProductPayload>;

export type CreateOrderItemPayload = Omit<OrderItem, never>;
export type UpdateOrderPayload = Partial<Omit<Order, "id" | "orderNumber" | "customerId">>;

export interface CreateOrderPayload {
  customerId: string;
  orderDate: string;
  status: OrderStatus;
  deliveryLeadDays: number;
  notes?: string;
  items: Array<{
    itemType: OrderItemType;
    itemId: string;
    quantity: number;
    discountType: DiscountType;
    discountValue: number;
    manualUnitPrice?: number | null;
  }>;
  productionSteps: Array<{
    workCenterId: string;
    stepName: string;
    description?: string;
    cost: number;
    timeHours: number;
    status?: OrderProductionStepStatus;
  }>;
}
