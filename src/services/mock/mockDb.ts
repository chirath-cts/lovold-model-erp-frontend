import rawDb from "../../../mock/db.json";

import type {
  Category,
  Customer,
  CustomerProduct,
  CustomerProductStatus,
  EntityStatus,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  User,
  CreateOrderItemPayload,
} from "@/shared/types/domain";

export interface ProductFilters {
  nameLike?: string;
  categoryId?: string;
}

export interface OrderFilters {
  status?: OrderStatus | "";
  customerId?: string;
}

const clone = <T>(value: T): T =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));

const toStatus = (value: string | undefined | null): EntityStatus =>
  value === "inactive" ? "inactive" : "active";

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toNullableString = (value: unknown) =>
  value === null || value === undefined || value === "" ? null : String(value);

const parseDate = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const deriveCustomerProductStatus = (agreement: Pick<CustomerProduct, "startDate" | "endDate" | "isActive">): CustomerProductStatus => {
  if (!agreement.isActive) return "expired";

  const today = new Date();
  const start = parseDate(agreement.startDate);
  const end = parseDate(agreement.endDate);

  if (start && start > today) return "future";
  if (end && end < today) return "expired";
  return "active";
};

type MutableDb = {
  categories: Category[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  orderItems: OrderItem[];
  customerProducts: CustomerProduct[];
  users: User[];
};

const normalizeDb = (db: typeof rawDb): MutableDb => {
  const categories: Category[] = Array.isArray(db.categories)
    ? db.categories.map((item) => ({
        id: String(item.id),
        name: String(item.name ?? ""),
        description: String(item.description ?? ""),
      }))
    : [];

  const customers: Customer[] = Array.isArray(db.customers)
    ? db.customers.map((item) => ({
        id: String(item.id),
        customerCode: String(item.customerCode ?? ""),
        name: String(item.name ?? ""),
        email: String(item.email ?? ""),
        phone: String(item.phone ?? ""),
        address: String(item.address ?? ""),
        status: toStatus(item.status),
      }))
    : [];

  const products: Product[] = Array.isArray(db.products)
    ? db.products.map((item) => ({
        id: String(item.id),
        name: String(item.name ?? ""),
        sku: String(item.sku ?? ""),
        categoryId: String(item.categoryId ?? ""),
        imageUrl: toNullableString(item.imageUrl),
        basePrice: toNumber(item.basePrice),
        purchasePrice: toNumber(item.purchasePrice ?? item.basePrice),
        stockQuantity: toNumber(item.stockQuantity),
        reorderLevel: toNumber(item.reorderLevel),
        unit: String(item.unit ?? "pcs"),
        status: toStatus(item.status),
        description: String(item.description ?? ""),
      }))
    : [];

  const customerProducts: CustomerProduct[] = Array.isArray(db.customerProducts)
    ? db.customerProducts.map((item) => {
        const normalized: CustomerProduct = {
          customerId: String(item.customerId ?? ""),
          productId: String(item.productId ?? ""),
          discountPercent: toNumber(item.discountPercent),
          startDate: item.startDate ? String(item.startDate) : null,
          endDate: item.endDate ? String(item.endDate) : null,
          isActive: Boolean(item.isActive),
          status: "active",
        };

        normalized.status = deriveCustomerProductStatus(normalized);
        return normalized;
      })
    : [];

  const orderItems: OrderItem[] = Array.isArray(db.orderItems)
    ? db.orderItems.map((item) => ({
        id: String(item.id),
        orderId: String(item.orderId ?? ""),
        productId: String(item.productId ?? ""),
        productSku: item.productSku ? String(item.productSku) : null,
        productName: item.productName ? String(item.productName) : null,
        productUnit: item.productUnit ? String(item.productUnit) : null,
        quantity: toNumber(item.quantity),
        unitPrice: toNumber(item.unitPrice),
        discountPercent: toNumber(item.discountPercent),
        discountAmount: toNumber(item.discountAmount),
        lineSubtotal: toNumber(item.lineSubtotal),
        lineTotal: toNumber(item.lineTotal),
        unitCostAtSale: toNumber(item.unitCostAtSale),
        profitAmount: toNumber(item.profitAmount),
      }))
    : [];

  const orderItemCounts = orderItems.reduce((map, item) => {
    map.set(item.orderId, (map.get(item.orderId) ?? 0) + 1);
    return map;
  }, new Map<string, number>());

  const orders: Order[] = Array.isArray(db.orders)
    ? db.orders.map((item) => ({
        id: String(item.id),
        orderNumber: String(item.orderNumber ?? ""),
        customerId: String(item.customerId ?? ""),
        orderDate: String(item.orderDate ?? new Date().toISOString()),
        status: (item.status as OrderStatus) ?? "confirmed",
        currency: "NOK",
        subtotal: toNumber(item.subtotal),
        discountTotal: toNumber(item.discountTotal),
        costTotal: toNumber(item.costTotal),
        profitTotal: toNumber(item.profitTotal),
        grandTotal: toNumber(item.grandTotal),
        itemCount: orderItemCounts.get(String(item.id)) ?? 0,
      }))
    : [];

  const users: User[] = Array.isArray(db.users)
    ? db.users.map((item) => ({
        id: String(item.id),
        username: String(item.username ?? ""),
        password: String(item.password ?? ""),
        firstName: String(item.firstName ?? ""),
        lastName: String(item.lastName ?? ""),
        email: String(item.email ?? ""),
        role: String(item.role ?? ""),
        status: toStatus(item.status),
        createdAt: String(item.createdAt ?? new Date().toISOString()),
      }))
    : [];

  return { categories, products, customers, orders, orderItems, customerProducts, users };
};

const db: MutableDb = normalizeDb(rawDb);

const setOrderItemCount = (orderId: string) => {
  const order = db.orders.find((item) => item.id === orderId);
  if (!order) return;
  order.itemCount = db.orderItems.filter((item) => item.orderId === orderId).length;
};

export const mockDb = {
  async listCategories() {
    return clone(db.categories);
  },

  async addCategory(category: Category) {
    db.categories.push(category);
    return clone(category);
  },

  async listProducts(filters?: ProductFilters) {
    const query = filters ?? {};
    const needle = query.nameLike?.toLowerCase().trim();

    let results = [...db.products];
    if (needle) {
      results = results.filter(
        (product) =>
          product.name.toLowerCase().includes(needle) ||
          product.sku.toLowerCase().includes(needle),
      );
    }

    if (query.categoryId) {
      results = results.filter((product) => product.categoryId === query.categoryId);
    }

    return clone(results);
  },

  async addProduct(payload: Product) {
    db.products.push(payload);
    return clone(payload);
  },

  async updateProduct(id: string, patch: Partial<Product>) {
    const product = db.products.find((item) => item.id === id);
    if (!product) throw new Error("Product not found");

    Object.assign(product, patch);
    return clone(product);
  },

  async updateProductStock(id: string, stockQuantity: number) {
    const product = db.products.find((item) => item.id === id);
    if (!product) throw new Error("Product not found");

    product.stockQuantity = Math.max(0, stockQuantity);
    return clone(product);
  },

  async listOrders(filters?: OrderFilters) {
    const query = filters ?? {};
    let results = [...db.orders];

    if (query.status) {
      results = results.filter((order) => order.status === query.status);
    }

    if (query.customerId) {
      results = results.filter((order) => order.customerId === query.customerId);
    }

    results.sort(
      (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
    );

    return clone(results);
  },

  async addOrder(payload: Omit<Order, "itemCount">) {
    const order: Order = { ...payload, itemCount: 0 };
    db.orders.push(order);
    return clone(order);
  },

  async updateOrder(id: string, patch: Partial<Order>) {
    const order = db.orders.find((item) => item.id === id);
    if (!order) throw new Error("Order not found");

    Object.assign(order, patch);
    return clone(order);
  },

  async removeOrder(id: string) {
    const orderIndex = db.orders.findIndex((item) => item.id === id);
    if (orderIndex === -1) return;

    db.orders.splice(orderIndex, 1);
    db.orderItems = db.orderItems.filter((item) => item.orderId !== id);
  },

  async listOrderItems(orderId?: string) {
    const items = orderId
      ? db.orderItems.filter((item) => item.orderId === orderId)
      : db.orderItems;

    return clone(
      items.sort((a, b) => a.id.localeCompare(b.id, undefined, { sensitivity: "base" })),
    );
  },

  async addOrderItem(payload: CreateOrderItemPayload) {
    const product = db.products.find((item) => item.id === payload.productId);
    const orderItem: OrderItem = {
      ...payload,
      productSku: product?.sku ?? null,
      productName: product?.name ?? null,
      productUnit: product?.unit ?? null,
    };

    db.orderItems.push(orderItem);
    setOrderItemCount(orderItem.orderId);
    return clone(orderItem);
  },

  async removeOrderItem(id: string) {
    const index = db.orderItems.findIndex((item) => item.id === id);
    if (index === -1) return;

    const [removed] = db.orderItems.splice(index, 1);
    setOrderItemCount(removed.orderId);
  },

  async listCustomerProducts(filters?: { customerId?: string; status?: string }) {
    const query = filters ?? {};
    let results = db.customerProducts.map((item) => ({
      ...item,
      status: deriveCustomerProductStatus(item),
    }));

    if (query.customerId) {
      results = results.filter((item) => item.customerId === query.customerId);
    }

    if (query.status) {
      results = results.filter((item) => item.status === query.status);
    }

    return clone(results);
  },

  async addCustomerProduct(payload: CustomerProduct) {
    const agreement: CustomerProduct = {
      ...payload,
      status: deriveCustomerProductStatus(payload),
    };
    db.customerProducts.push(agreement);
    return clone(agreement);
  },

  async updateCustomerProduct(id: string, patch: Partial<CustomerProduct>) {
    const index = db.customerProducts.findIndex(
      (item) => `${item.customerId}-${item.productId}` === id,
    );

    if (index === -1) throw new Error("Customer pricing agreement not found");

    const current = db.customerProducts[index];
    const next: CustomerProduct = {
      ...current,
      ...patch,
    };
    next.status = deriveCustomerProductStatus(next);
    db.customerProducts[index] = next;

    return clone(next);
  },

  async listCustomers() {
    return clone(
      db.customers.slice().sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
    );
  },

  async getCustomerById(id: string) {
    const customer = db.customers.find((item) => item.id === id);
    if (!customer) throw new Error("Customer not found");
    return clone(customer);
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
