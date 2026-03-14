import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_FILE = path.resolve(__dirname, "../../mock/db.json");

const parseJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf-8"));

const getScopeColumns = (scopeType, scopeId) => {
  if (scopeType === "category") {
    return { categoryId: scopeId, productId: null };
  }
  return { categoryId: null, productId: scopeId };
};

const sortDateDesc = (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();

export async function initializeSchema(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      customer_code TEXT,
      company_name TEXT NOT NULL,
      contact_person TEXT,
      country TEXT,
      name TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      status TEXT,
      created_at TEXT
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
      name TEXT NOT NULL,
      sku TEXT,
      category_id TEXT NOT NULL,
      unit_price REAL,
      fixed_cost_price REAL,
      currency TEXT,
      unit TEXT,
      stock_quantity INTEGER,
      reorder_level INTEGER,
      description TEXT,
      status TEXT,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT,
      password TEXT,
      first_name TEXT,
      last_name TEXT,
      email TEXT,
      role TEXT,
      status TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT,
      customer_id TEXT NOT NULL,
      order_date TEXT,
      status TEXT,
      currency TEXT,
      total_amount REAL,
      total_discount REAL,
      total_cost REAL,
      estimated_profit REAL,
      item_count INTEGER,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS order_product (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_sku TEXT,
      product_name_snapshot TEXT,
      quantity REAL,
      unit TEXT,
      currency TEXT,
      selling_price_snapshot REAL,
      fixed_cost_snapshot REAL,
      discount_type TEXT,
      discount_value REAL,
      discount_amount REAL,
      line_subtotal REAL,
      line_total REAL,
      line_profit REAL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS product_customer (
      id TEXT PRIMARY KEY,
      name TEXT,
      customer_id TEXT NOT NULL,
      product_id TEXT,
      category_id TEXT,
      scope_type TEXT,
      scope_id TEXT,
      discount_type TEXT,
      value REAL,
      currency TEXT,
      start_date TEXT,
      end_date TEXT,
      status TEXT,
      discount_percent REAL,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS warehouse_product (
      id TEXT PRIMARY KEY,
      warehouse_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      supplier_id TEXT NOT NULL,
      stock_quantity INTEGER,
      reorder_level INTEGER,
      supplier_price REAL,
      supplier_discount REAL,
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    );

    CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
    CREATE INDEX IF NOT EXISTS idx_order_product_order_id ON order_product(order_id);
    CREATE INDEX IF NOT EXISTS idx_product_customer_customer_id ON product_customer(customer_id);
    CREATE INDEX IF NOT EXISTS idx_product_customer_status ON product_customer(status);
    CREATE INDEX IF NOT EXISTS idx_warehouse_product_product_id ON warehouse_product(product_id);
  `);
}

async function hasSeedData(db) {
  const row = await db.get("SELECT COUNT(1) AS count FROM customers");
  return (row?.count ?? 0) > 0;
}

async function clearAllTables(db) {
  await db.exec(`
    DELETE FROM warehouse_product;
    DELETE FROM product_customer;
    DELETE FROM order_product;
    DELETE FROM orders;
    DELETE FROM users;
    DELETE FROM products;
    DELETE FROM categories;
    DELETE FROM warehouses;
    DELETE FROM suppliers;
    DELETE FROM customers;
  `);
}

function deriveSeed(seed) {
  const categories = seed.categories ?? seed.productCategories ?? [];
  const products = seed.products ?? [];
  const customers = seed.customers ?? [];
  const suppliers = seed.suppliers ?? [];
  const warehouses = seed.warehouses ?? [];
  const warehouseProducts = seed.warehouseProducts ?? [];
  const orders = (seed.orders ?? []).slice().sort(sortDateDesc);
  const orderItems = seed.orderItems ?? [];
  const discounts = seed.discounts ?? [];
  const users = seed.users ?? [];

  const safeSuppliers = suppliers.length
    ? suppliers
    : [
        {
          id: "sup-derived-01",
          name: "Default Supplier",
          email: "supply@lovold.local",
          phone: "+47 000 00 001",
          address: "Oslo, Norway",
          status: "active",
        },
      ];

  const safeWarehouses = warehouses.length
    ? warehouses
    : [
        {
          id: "wh-derived-01",
          name: "Default Warehouse",
          location: "Oslo, Norway",
        },
      ];

  const safeWarehouseProducts = warehouseProducts.length
    ? warehouseProducts
    : products.map((product, index) => ({
        id: `wp-derived-${String(index + 1).padStart(3, "0")}`,
        warehouseId: safeWarehouses[index % safeWarehouses.length].id,
        productId: product.id,
        supplierId: safeSuppliers[index % safeSuppliers.length].id,
        stockQuantity: product.stockQuantity ?? 0,
        reorderLevel: product.reorderLevel ?? 0,
        supplierPrice: product.fixedCostPrice ?? 0,
        supplierDiscount: 0,
      }));

  const safeDiscounts = discounts.length
    ? discounts
    : products.slice(0, Math.min(5, products.length)).map((product, index) => ({
        id: `dsc-derived-${String(index + 1).padStart(3, "0")}`,
        name: `Derived Discount ${index + 1}`,
        customerId: customers[index % customers.length]?.id,
        scopeType: "product",
        scopeId: product.id,
        discountType: "percentage",
        value: 5,
        currency: "NOK",
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        status: "active",
      }));

  const safeOrderItems = orderItems.length
    ? orderItems
    : orders.flatMap((order, index) => {
        const product = products[index % products.length];
        if (!product) return [];
        const quantity = 1;
        const lineSubtotal = Number(product.unitPrice ?? 0);
        const lineTotal = lineSubtotal;

        return [
          {
            id: `oi-derived-${String(index + 1).padStart(3, "0")}`,
            orderId: order.id,
            productId: product.id,
            productSku: product.sku,
            productNameSnapshot: product.name,
            quantity,
            unit: product.unit,
            currency: "NOK",
            sellingPriceSnapshot: Number(product.unitPrice ?? 0),
            fixedCostSnapshot: Number(product.fixedCostPrice ?? 0),
            discountType: "percentage",
            discountValue: 0,
            discountAmount: 0,
            lineSubtotal,
            lineTotal,
            lineProfit: lineTotal - Number(product.fixedCostPrice ?? 0) * quantity,
          },
        ];
      });

  return {
    categories,
    products,
    customers,
    suppliers: safeSuppliers,
    warehouses: safeWarehouses,
    warehouseProducts: safeWarehouseProducts,
    orders,
    orderItems: safeOrderItems,
    discounts: safeDiscounts,
    users,
  };
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

    const insertCustomer = await db.prepare(`
      INSERT INTO customers (id, customer_code, company_name, contact_person, country, name, email, phone, address, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const row of seed.customers) {
      await insertCustomer.run(
        row.id,
        row.customerCode ?? null,
        row.companyName ?? row.name ?? "",
        row.contactPerson ?? null,
        row.country ?? null,
        row.name ?? row.companyName ?? "",
        row.email ?? null,
        row.phone ?? null,
        row.address ?? null,
        row.status ?? "active",
        row.createdAt ?? null,
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
      INSERT INTO products (id, name, sku, category_id, unit_price, fixed_cost_price, currency, unit, stock_quantity, reorder_level, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const row of seed.products) {
      await insertProduct.run(
        row.id,
        row.name,
        row.sku ?? null,
        row.categoryId,
        Number(row.unitPrice ?? 0),
        Number(row.fixedCostPrice ?? 0),
        row.currency ?? "NOK",
        row.unit ?? null,
        Number(row.stockQuantity ?? 0),
        Number(row.reorderLevel ?? 0),
        row.description ?? null,
        row.status ?? "active",
      );
    }
    await insertProduct.finalize();

    const insertUser = await db.prepare(`
      INSERT INTO users (id, username, password, first_name, last_name, email, role, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        row.createdAt ?? null,
      );
    }
    await insertUser.finalize();

    const insertOrder = await db.prepare(`
      INSERT INTO orders (id, order_number, customer_id, order_date, status, currency, total_amount, total_discount, total_cost, estimated_profit, item_count)
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
        Number(row.totalAmount ?? 0),
        Number(row.totalDiscount ?? 0),
        Number(row.totalCost ?? 0),
        Number(row.estimatedProfit ?? 0),
        Number(row.itemCount ?? 0),
      );
    }
    await insertOrder.finalize();

    const insertOrderProduct = await db.prepare(`
      INSERT INTO order_product (
        id, order_id, product_id, product_sku, product_name_snapshot, quantity, unit, currency,
        selling_price_snapshot, fixed_cost_snapshot, discount_type, discount_value, discount_amount,
        line_subtotal, line_total, line_profit
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const row of seed.orderItems) {
      await insertOrderProduct.run(
        row.id,
        row.orderId,
        row.productId,
        row.productSku ?? null,
        row.productNameSnapshot ?? null,
        Number(row.quantity ?? 0),
        row.unit ?? null,
        row.currency ?? "NOK",
        Number(row.sellingPriceSnapshot ?? 0),
        Number(row.fixedCostSnapshot ?? 0),
        row.discountType ?? "percentage",
        Number(row.discountValue ?? 0),
        Number(row.discountAmount ?? 0),
        Number(row.lineSubtotal ?? 0),
        Number(row.lineTotal ?? 0),
        Number(row.lineProfit ?? 0),
      );
    }
    await insertOrderProduct.finalize();

    const insertProductCustomer = await db.prepare(`
      INSERT INTO product_customer (
        id, name, customer_id, product_id, category_id, scope_type, scope_id, discount_type, value,
        currency, start_date, end_date, status, discount_percent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const row of seed.discounts) {
      const scope = getScopeColumns(row.scopeType, row.scopeId);
      await insertProductCustomer.run(
        row.id,
        row.name ?? null,
        row.customerId,
        scope.productId,
        scope.categoryId,
        row.scopeType,
        row.scopeId,
        row.discountType ?? "percentage",
        Number(row.value ?? 0),
        row.currency ?? "NOK",
        row.startDate ?? null,
        row.endDate ?? null,
        row.status ?? "active",
        row.discountType === "percentage" ? Number(row.value ?? 0) : null,
      );
    }
    await insertProductCustomer.finalize();

    const insertWarehouseProduct = await db.prepare(`
      INSERT INTO warehouse_product (
        id, warehouse_id, product_id, supplier_id, stock_quantity, reorder_level, supplier_price, supplier_discount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const row of seed.warehouseProducts) {
      await insertWarehouseProduct.run(
        row.id,
        row.warehouseId,
        row.productId,
        row.supplierId,
        Number(row.stockQuantity ?? 0),
        Number(row.reorderLevel ?? 0),
        Number(row.supplierPrice ?? 0),
        Number(row.supplierDiscount ?? 0),
      );
    }
    await insertWarehouseProduct.finalize();

    await db.exec("COMMIT");
    return { seeded: true };
  } catch (error) {
    await db.exec("ROLLBACK");
    throw error;
  }
}
