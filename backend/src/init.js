import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_FILE = path.resolve(__dirname, "../../mock/db.json");

const parseJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf-8"));

const sortDateDesc = (a, b) => new Date(b.orderDate ?? 0).getTime() - new Date(a.orderDate ?? 0).getTime();

const numeric = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const integer = (value, fallback = 0) => {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const boolToSql = (value, fallback = true) => {
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number") return value ? 1 : 0;
  if (typeof value === "string") return ["1", "true", "yes", "active"].includes(value.toLowerCase()) ? 1 : 0;
  return fallback ? 1 : 0;
};

const uniqueBy = (rows, keyBuilder) => {
  const map = new Map();
  for (const row of rows) {
    map.set(keyBuilder(row), row);
  }
  return [...map.values()];
};

const normalizeCustomers = (rows) =>
  (rows ?? [])
    .filter((row) => row?.id)
    .map((row) => ({
      id: row.id,
      customerCode: row.customerCode ?? row.customer_code ?? null,
      name: row.name ?? row.companyName ?? row.company_name ?? null,
      email: row.email ?? null,
      phone: row.phone ?? null,
      address: row.address ?? null,
      status: row.status ?? "active",
    }));

const normalizeProducts = (rows) =>
  (rows ?? [])
    .filter((row) => row?.id && (row.categoryId ?? row.category_id))
    .map((row) => ({
      id: row.id,
      categoryId: row.categoryId ?? row.category_id,
      name: row.name ?? "",
      sku: row.sku ?? null,
      description: row.description ?? null,
      basePrice: numeric(row.basePrice ?? row.base_price ?? row.unitPrice ?? row.unit_price, 0),
      unit: row.unit ?? null,
      status: row.status ?? "active",
    }));

const normalizeOrders = (rows) =>
  (rows ?? [])
    .filter((row) => row?.id && (row?.customerId ?? row?.customer_id))
    .map((row) => {
      const grandTotal = numeric(row.grandTotal ?? row.grand_total ?? row.totalAmount ?? row.total_amount, 0);
      const discountTotal = numeric(row.discountTotal ?? row.discount_total ?? row.totalDiscount ?? row.total_discount, 0);

      return {
        id: row.id,
        orderNumber: row.orderNumber ?? row.order_number ?? null,
        customerId: row.customerId ?? row.customer_id,
        orderDate: row.orderDate ?? row.order_date ?? null,
        status: row.status ?? "draft",
        currency: row.currency ?? "NOK",
        subtotal: numeric(row.subtotal, grandTotal + discountTotal),
        discountTotal,
        costTotal: numeric(row.costTotal ?? row.cost_total ?? row.totalCost ?? row.total_cost, 0),
        profitTotal: numeric(row.profitTotal ?? row.profit_total ?? row.estimatedProfit ?? row.estimated_profit, 0),
        grandTotal,
      };
    });

const normalizeOrderProducts = (canonicalRows, compatibilityRows) => {
  if (Array.isArray(canonicalRows) && canonicalRows.length > 0) {
    return canonicalRows
      .filter((row) => row?.id && (row?.productId ?? row?.product_id) && (row?.orderId ?? row?.order_id))
      .map((row) => ({
        id: row.id,
        productId: row.productId ?? row.product_id,
        orderId: row.orderId ?? row.order_id,
        quantity: numeric(row.quantity, 0),
        unitPrice: numeric(row.unitPrice ?? row.unit_price ?? row.sellingPriceSnapshot ?? row.selling_price_snapshot, 0),
        lineSubtotal: numeric(row.lineSubtotal ?? row.line_subtotal, 0),
        discountPercent: numeric(row.discountPercent ?? row.discount_percent, 0),
        discountAmount: numeric(row.discountAmount ?? row.discount_amount, 0),
        lineTotal: numeric(row.lineTotal ?? row.line_total, 0),
        unitCostAtSale: numeric(row.unitCostAtSale ?? row.unit_cost_at_sale ?? row.fixedCostSnapshot ?? row.fixed_cost_snapshot, 0),
        profitAmount: numeric(row.profitAmount ?? row.profit_amount ?? row.lineProfit ?? row.line_profit, 0),
      }));
  }

  return (compatibilityRows ?? [])
    .filter((row) => row?.id && row?.productId && row?.orderId)
    .map((row) => {
      const lineSubtotal = numeric(row.lineSubtotal ?? row.line_subtotal, 0);
      const discountAmount = numeric(row.discountAmount ?? row.discount_amount, 0);
      const discountPercent =
        (row.discountType ?? row.discount_type) === "percentage"
          ? numeric(row.discountValue ?? row.discount_value, 0)
          : lineSubtotal > 0
            ? (discountAmount / lineSubtotal) * 100
            : 0;

      return {
        id: row.id,
        productId: row.productId ?? row.product_id,
        orderId: row.orderId ?? row.order_id,
        quantity: numeric(row.quantity, 0),
        unitPrice: numeric(row.unitPrice ?? row.unit_price ?? row.sellingPriceSnapshot ?? row.selling_price_snapshot, 0),
        lineSubtotal,
        discountPercent: numeric(discountPercent, 0),
        discountAmount,
        lineTotal: numeric(row.lineTotal ?? row.line_total, 0),
        unitCostAtSale: numeric(row.unitCostAtSale ?? row.unit_cost_at_sale ?? row.fixedCostSnapshot ?? row.fixed_cost_snapshot, 0),
        profitAmount: numeric(row.profitAmount ?? row.profit_amount ?? row.lineProfit ?? row.line_profit, 0),
      };
    });
};

const normalizeCustomerProducts = (canonicalRows, discounts, products) => {
  const productById = new Map(products.map((product) => [product.id, product]));
  const productsByCategory = new Map();

  for (const product of products) {
    const list = productsByCategory.get(product.categoryId) ?? [];
    list.push(product);
    productsByCategory.set(product.categoryId, list);
  }

  if (Array.isArray(canonicalRows) && canonicalRows.length > 0) {
    return uniqueBy(
      canonicalRows
        .filter((row) => (row?.customerId ?? row?.customer_id) && (row?.productId ?? row?.product_id))
        .map((row) => ({
          customerId: row.customerId ?? row.customer_id,
          productId: row.productId ?? row.product_id,
          discountPercent: numeric(row.discountPercent ?? row.discount_percent ?? row.value, 0),
          startDate: row.startDate ?? row.start_date ?? null,
          endDate: row.endDate ?? row.end_date ?? null,
          isActive: boolToSql(row.isActive ?? row.is_active, true),
        })),
      (row) => `${row.customerId}::${row.productId}`,
    );
  }

  const rows = [];
  const sortedDiscounts = [...(discounts ?? [])].sort((a, b) => {
    if ((a.scopeType ?? "") === (b.scopeType ?? "")) return 0;
    return (a.scopeType ?? "") === "product" ? -1 : 1;
  });

  for (const discount of sortedDiscounts) {
    const customerId = discount.customerId ?? discount.customer_id;
    const scopeType = discount.scopeType ?? discount.scope_type;
    const scopeId = discount.scopeId ?? discount.scope_id;
    if (!customerId || !scopeType || !scopeId) continue;

    const resolvePercent = (productId) => {
      const discountType = discount.discountType ?? discount.discount_type ?? "percentage";
      const value = numeric(discount.value, 0);
      if (discountType === "percentage") return value;

      const product = productById.get(productId);
      const basePrice = numeric(product?.basePrice, 0);
      if (basePrice <= 0) return 0;
      return (value / basePrice) * 100;
    };

    if (scopeType === "product") {
      rows.push({
        customerId,
        productId: scopeId,
        discountPercent: resolvePercent(scopeId),
        startDate: discount.startDate ?? discount.start_date ?? null,
        endDate: discount.endDate ?? discount.end_date ?? null,
        isActive: boolToSql(discount.isActive ?? discount.is_active ?? discount.status === "active", true),
      });
      continue;
    }

    if (scopeType === "category") {
      for (const product of productsByCategory.get(scopeId) ?? []) {
        rows.push({
          customerId,
          productId: product.id,
          discountPercent: resolvePercent(product.id),
          startDate: discount.startDate ?? discount.start_date ?? null,
          endDate: discount.endDate ?? discount.end_date ?? null,
          isActive: boolToSql(discount.isActive ?? discount.is_active ?? discount.status === "active", true),
        });
      }
    }
  }

  return uniqueBy(rows, (row) => `${row.customerId}::${row.productId}`);
};

const normalizeSupplierProducts = (canonicalRows, warehouseProducts) => {
  if (Array.isArray(canonicalRows) && canonicalRows.length > 0) {
    return uniqueBy(
      canonicalRows
        .filter((row) => row?.id && (row?.productId ?? row?.product_id) && (row?.supplierId ?? row?.supplier_id))
        .map((row) => ({
          id: row.id,
          productId: row.productId ?? row.product_id,
          supplierId: row.supplierId ?? row.supplier_id,
          supplierSku: row.supplierSku ?? row.supplier_sku ?? null,
          purchasePrice: numeric(row.purchasePrice ?? row.purchase_price ?? row.supplierPrice ?? row.supplier_price, 0),
          supplierDiscountPercent: numeric(
            row.supplierDiscountPercent ?? row.supplier_discount_percent ?? row.supplierDiscount ?? row.supplier_discount,
            0,
          ),
          leadTimeDays: integer(row.leadTimeDays ?? row.lead_time_days, 0),
          isPrimarySupplier: boolToSql(row.isPrimarySupplier ?? row.is_primary_supplier, false),
          minOrderQty: numeric(row.minOrderQty ?? row.min_order_qty, 1),
        })),
      (row) => `${row.supplierId}::${row.productId}`,
    );
  }

  const uniquePairs = uniqueBy(
    (warehouseProducts ?? []).filter((row) => row?.supplierId && row?.productId),
    (row) => `${row.supplierId}::${row.productId}`,
  );

  return uniquePairs.map((row, index) => ({
    id: `sp-derived-${String(index + 1).padStart(3, "0")}`,
    productId: row.productId,
    supplierId: row.supplierId,
    supplierSku: null,
    purchasePrice: numeric(row.supplierPrice, 0),
    supplierDiscountPercent: numeric(row.supplierDiscount, 0),
    leadTimeDays: 7,
    isPrimarySupplier: 0,
    minOrderQty: 1,
  }));
};

const normalizeInventories = (canonicalRows, warehouseProducts) => {
  if (Array.isArray(canonicalRows) && canonicalRows.length > 0) {
    return uniqueBy(
      canonicalRows
        .filter((row) => row?.id && (row?.warehouseId ?? row?.warehouse_id) && (row?.productId ?? row?.product_id))
        .map((row) => ({
          id: row.id,
          warehouseId: row.warehouseId ?? row.warehouse_id,
          productId: row.productId ?? row.product_id,
          stockQuantity: integer(row.stockQuantity ?? row.stock_quantity, 0),
          reorderLevel: integer(row.reorderLevel ?? row.reorder_level, 0),
          reservedQuantity: integer(row.reservedQuantity ?? row.reserved_quantity, 0),
          lastStockUpdateAt: row.lastStockUpdateAt ?? row.last_stock_update_at ?? null,
        })),
      (row) => `${row.warehouseId}::${row.productId}`,
    );
  }

  return uniqueBy(
    (warehouseProducts ?? [])
      .filter((row) => row?.id && row?.warehouseId && row?.productId)
      .map((row) => ({
        id: row.id,
        warehouseId: row.warehouseId,
        productId: row.productId,
        stockQuantity: integer(row.stockQuantity, 0),
        reorderLevel: integer(row.reorderLevel, 0),
        reservedQuantity: 0,
        lastStockUpdateAt: null,
      })),
    (row) => `${row.warehouseId}::${row.productId}`,
  );
};

const normalizeOrderStatusHistories = (canonicalRows, orders, users) => {
  if (Array.isArray(canonicalRows) && canonicalRows.length > 0) {
    return canonicalRows
      .filter((row) => row?.id && (row?.orderId ?? row?.order_id))
      .map((row) => ({
        id: row.id,
        orderId: row.orderId ?? row.order_id,
        status: row.status ?? null,
        changedBy: row.changedBy ?? row.changed_by ?? null,
        changedAt: row.changedAt ?? row.changed_at ?? null,
        remarks: row.remarks ?? null,
      }));
  }

  const activeUsers = users.filter((user) => user.status === "active");
  return orders.map((order, index) => ({
    id: `osh-derived-${String(index + 1).padStart(3, "0")}`,
    orderId: order.id,
    status: order.status ?? "draft",
    changedBy: activeUsers[index % (activeUsers.length || 1)]?.id ?? users[0]?.id ?? null,
    changedAt: order.orderDate ?? null,
    remarks: "Seeded initial status",
  }));
};

const ensureInventoryCoverage = (inventories, products, warehouses) => {
  if (products.length === 0 || warehouses.length === 0) return inventories;
  const primaryWarehouseId = warehouses[0].id;
  const coveredProductIds = new Set(inventories.map((row) => row.productId));
  const next = [...inventories];

  let seq = 1;
  for (const product of products) {
    if (coveredProductIds.has(product.id)) continue;
    next.push({
      id: `inv-derived-${String(seq).padStart(3, "0")}`,
      warehouseId: primaryWarehouseId,
      productId: product.id,
      stockQuantity: 0,
      reorderLevel: 0,
      reservedQuantity: 0,
      lastStockUpdateAt: null,
    });
    seq += 1;
  }

  return next;
};

function deriveSeed(seed) {
  const categories = (seed.categories ?? seed.productCategories ?? [])
    .filter((row) => row?.id)
    .map((row) => ({
      id: row.id,
      name: row.name ?? "",
      description: row.description ?? null,
    }));

  const customers = normalizeCustomers(seed.customers);
  const suppliers = (seed.suppliers ?? [])
    .filter((row) => row?.id)
    .map((row) => ({
      id: row.id,
      name: row.name ?? "",
      email: row.email ?? null,
      phone: row.phone ?? null,
      address: row.address ?? null,
      status: row.status ?? "active",
    }));

  const warehouses = (seed.warehouses ?? [])
    .filter((row) => row?.id)
    .map((row) => ({
      id: row.id,
      name: row.name ?? "",
      location: row.location ?? null,
    }));

  const users = (seed.users ?? [])
    .filter((row) => row?.id)
    .map((row) => ({
      id: row.id,
      username: row.username ?? null,
      password: row.password ?? null,
      firstName: row.firstName ?? row.first_name ?? null,
      lastName: row.lastName ?? row.last_name ?? null,
      email: row.email ?? null,
      role: row.role ?? null,
      status: row.status ?? "active",
    }));

  const products = normalizeProducts(seed.products);
  const orders = normalizeOrders(seed.orders).sort(sortDateDesc);
  const orderProducts = normalizeOrderProducts(seed.orderProducts, seed.orderItems);
  const customerProducts = normalizeCustomerProducts(seed.customerProducts, seed.discounts, products);
  const supplierProducts = normalizeSupplierProducts(seed.supplierProducts, seed.warehouseProducts);
  const inventories = normalizeInventories(seed.inventories, seed.warehouseProducts);
  const orderStatusHistories = normalizeOrderStatusHistories(seed.orderStatusHistories, orders, users);

  const categoryIds = new Set(categories.map((row) => row.id));
  const customerIds = new Set(customers.map((row) => row.id));
  const supplierIds = new Set(suppliers.map((row) => row.id));
  const warehouseIds = new Set(warehouses.map((row) => row.id));
  const userIds = new Set(users.map((row) => row.id));

  const validProducts = products.filter((row) => categoryIds.has(row.categoryId));
  const productIds = new Set(validProducts.map((row) => row.id));

  const validOrders = orders.filter((row) => customerIds.has(row.customerId));
  const orderIds = new Set(validOrders.map((row) => row.id));

  return {
    categories,
    customers,
    suppliers,
    warehouses,
    users,
    products: validProducts,
    orders: validOrders,
    orderProducts: orderProducts.filter((row) => orderIds.has(row.orderId) && productIds.has(row.productId)),
    customerProducts: customerProducts.filter((row) => customerIds.has(row.customerId) && productIds.has(row.productId)),
    supplierProducts: supplierProducts.filter((row) => supplierIds.has(row.supplierId) && productIds.has(row.productId)),
    inventories: ensureInventoryCoverage(
      inventories.filter((row) => warehouseIds.has(row.warehouseId) && productIds.has(row.productId)),
      validProducts,
      warehouses,
    ),
    orderStatusHistories: orderStatusHistories.filter(
      (row) => orderIds.has(row.orderId) && (!row.changedBy || userIds.has(row.changedBy)),
    ),
  };
}

export async function initializeSchema(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT,
      password TEXT,
      first_name TEXT,
      last_name TEXT,
      email TEXT,
      role TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      customer_code TEXT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS warehouses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sku TEXT,
      description TEXT,
      base_price REAL,
      unit TEXT,
      status TEXT,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE,
      customer_id TEXT NOT NULL,
      order_date TEXT,
      status TEXT,
      currency TEXT,
      subtotal REAL,
      discount_total REAL,
      cost_total REAL,
      profit_total REAL,
      grand_total REAL,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS order_product (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      order_id TEXT NOT NULL,
      quantity REAL,
      unit_price REAL,
      line_subtotal REAL,
      discount_percent REAL,
      discount_amount REAL,
      line_total REAL,
      unit_cost_at_sale REAL,
      profit_amount REAL,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS customer_product (
      customer_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      discount_percent REAL,
      start_date TEXT,
      end_date TEXT,
      is_active INTEGER DEFAULT 1,
      PRIMARY KEY (customer_id, product_id),
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS supplier_product (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      supplier_id TEXT NOT NULL,
      supplier_sku TEXT,
      purchase_price REAL,
      supplier_discount_percent REAL,
      lead_time_days INTEGER,
      is_primary_supplier INTEGER DEFAULT 0,
      min_order_qty REAL,
      UNIQUE (supplier_id, product_id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      warehouse_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      stock_quantity INTEGER,
      reorder_level INTEGER,
      reserved_quantity INTEGER,
      last_stock_update_at TEXT,
      UNIQUE (warehouse_id, product_id),
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS order_status_history (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      status TEXT,
      changed_by TEXT,
      changed_at TEXT,
      remarks TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (changed_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
    CREATE INDEX IF NOT EXISTS idx_order_product_order_id ON order_product(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_product_product_id ON order_product(product_id);
    CREATE INDEX IF NOT EXISTS idx_customer_product_customer_id ON customer_product(customer_id);
    CREATE INDEX IF NOT EXISTS idx_customer_product_product_id ON customer_product(product_id);
    CREATE INDEX IF NOT EXISTS idx_supplier_product_product_id ON supplier_product(product_id);
    CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
    CREATE INDEX IF NOT EXISTS idx_inventory_warehouse_id ON inventory(warehouse_id);
    CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
  `);
}

async function hasSeedData(db) {
  const row = await db.get("SELECT COUNT(1) AS count FROM customers");
  return (row?.count ?? 0) > 0;
}

async function clearAllTables(db) {
  await db.exec(`
    DELETE FROM order_status_history;
    DELETE FROM inventory;
    DELETE FROM supplier_product;
    DELETE FROM customer_product;
    DELETE FROM order_product;
    DELETE FROM orders;
    DELETE FROM products;
    DELETE FROM categories;
    DELETE FROM warehouses;
    DELETE FROM suppliers;
    DELETE FROM customers;
    DELETE FROM users;
  `);
}

export async function seedDatabase(db, options = { forceReset: false }) {
  if (!fs.existsSync(SEED_FILE)) {
    throw new Error(`Seed file not found: ${SEED_FILE}`);
  }

  const alreadySeeded = await hasSeedData(db);
  if (alreadySeeded && !options.forceReset) {
    return { seeded: false };
  }

  const source = parseJson(SEED_FILE);
  const seed = deriveSeed(source);

  await db.exec("BEGIN TRANSACTION");
  try {
    if (options.forceReset) {
      await clearAllTables(db);
    }

    const insertUser = await db.prepare(`
      INSERT INTO users (id, username, password, first_name, last_name, email, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const row of seed.users) {
      await insertUser.run(
        row.id,
        row.username ?? null,
        row.password ?? null,
        row.firstName ?? null,
        row.lastName ?? null,
        row.email ?? null,
        row.role ?? null,
        row.status ?? "active",
      );
    }
    await insertUser.finalize();

    const insertCustomer = await db.prepare(`
      INSERT INTO customers (id, customer_code, name, email, phone, address, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const row of seed.customers) {
      await insertCustomer.run(
        row.id,
        row.customerCode ?? null,
        row.name ?? "",
        row.email ?? null,
        row.phone ?? null,
        row.address ?? null,
        row.status ?? "active",
      );
    }
    await insertCustomer.finalize();

    const insertSupplier = await db.prepare(`
      INSERT INTO suppliers (id, name, email, phone, address, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const row of seed.suppliers) {
      await insertSupplier.run(row.id, row.name, row.email ?? null, row.phone ?? null, row.address ?? null, row.status ?? "active");
    }
    await insertSupplier.finalize();

    const insertWarehouse = await db.prepare(`
      INSERT INTO warehouses (id, name, location)
      VALUES (?, ?, ?)
    `);
    for (const row of seed.warehouses) {
      await insertWarehouse.run(row.id, row.name, row.location ?? null);
    }
    await insertWarehouse.finalize();

    const insertCategory = await db.prepare(`
      INSERT INTO categories (id, name, description)
      VALUES (?, ?, ?)
    `);
    for (const row of seed.categories) {
      await insertCategory.run(row.id, row.name, row.description ?? null);
    }
    await insertCategory.finalize();

    const insertProduct = await db.prepare(`
      INSERT INTO products (id, category_id, name, sku, description, base_price, unit, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const row of seed.products) {
      await insertProduct.run(
        row.id,
        row.categoryId,
        row.name,
        row.sku ?? null,
        row.description ?? null,
        numeric(row.basePrice, 0),
        row.unit ?? null,
        row.status ?? "active",
      );
    }
    await insertProduct.finalize();

    const insertOrder = await db.prepare(`
      INSERT INTO orders (id, order_number, customer_id, order_date, status, currency, subtotal, discount_total, cost_total, profit_total, grand_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const row of seed.orders) {
      await insertOrder.run(
        row.id,
        row.orderNumber ?? null,
        row.customerId,
        row.orderDate ?? null,
        row.status ?? "draft",
        row.currency ?? "NOK",
        numeric(row.subtotal, 0),
        numeric(row.discountTotal, 0),
        numeric(row.costTotal, 0),
        numeric(row.profitTotal, 0),
        numeric(row.grandTotal, 0),
      );
    }
    await insertOrder.finalize();

    const insertCustomerProduct = await db.prepare(`
      INSERT INTO customer_product (customer_id, product_id, discount_percent, start_date, end_date, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const row of seed.customerProducts) {
      await insertCustomerProduct.run(
        row.customerId,
        row.productId,
        numeric(row.discountPercent, 0),
        row.startDate ?? null,
        row.endDate ?? null,
        boolToSql(row.isActive, true),
      );
    }
    await insertCustomerProduct.finalize();

    const insertSupplierProduct = await db.prepare(`
      INSERT INTO supplier_product (
        id, product_id, supplier_id, supplier_sku, purchase_price, supplier_discount_percent,
        lead_time_days, is_primary_supplier, min_order_qty
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const row of seed.supplierProducts) {
      await insertSupplierProduct.run(
        row.id,
        row.productId,
        row.supplierId,
        row.supplierSku ?? null,
        numeric(row.purchasePrice, 0),
        numeric(row.supplierDiscountPercent, 0),
        integer(row.leadTimeDays, 0),
        boolToSql(row.isPrimarySupplier, false),
        numeric(row.minOrderQty, 1),
      );
    }
    await insertSupplierProduct.finalize();

    const insertInventory = await db.prepare(`
      INSERT INTO inventory (
        id, warehouse_id, product_id, stock_quantity, reorder_level, reserved_quantity, last_stock_update_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const row of seed.inventories) {
      await insertInventory.run(
        row.id,
        row.warehouseId,
        row.productId,
        integer(row.stockQuantity, 0),
        integer(row.reorderLevel, 0),
        integer(row.reservedQuantity, 0),
        row.lastStockUpdateAt ?? null,
      );
    }
    await insertInventory.finalize();

    const insertOrderProduct = await db.prepare(`
      INSERT INTO order_product (
        id, product_id, order_id, quantity, unit_price, line_subtotal, discount_percent, discount_amount, line_total,
        unit_cost_at_sale, profit_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const row of seed.orderProducts) {
      await insertOrderProduct.run(
        row.id,
        row.productId,
        row.orderId,
        numeric(row.quantity, 0),
        numeric(row.unitPrice, 0),
        numeric(row.lineSubtotal, 0),
        numeric(row.discountPercent, 0),
        numeric(row.discountAmount, 0),
        numeric(row.lineTotal, 0),
        numeric(row.unitCostAtSale, 0),
        numeric(row.profitAmount, 0),
      );
    }
    await insertOrderProduct.finalize();

    const insertOrderStatusHistory = await db.prepare(`
      INSERT INTO order_status_history (id, order_id, status, changed_by, changed_at, remarks)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const row of seed.orderStatusHistories) {
      await insertOrderStatusHistory.run(
        row.id,
        row.orderId,
        row.status ?? null,
        row.changedBy ?? null,
        row.changedAt ?? null,
        row.remarks ?? null,
      );
    }
    await insertOrderStatusHistory.finalize();

    await db.exec("COMMIT");
    return { seeded: true };
  } catch (error) {
    await db.exec("ROLLBACK");
    throw error;
  }
}
