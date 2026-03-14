import express from "express";
import cors from "cors";

import { openDb } from "./db.js";
import { initializeSchema, seedDatabase } from "./init.js";

const PORT = Number(process.env.PORT || 4001);

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const badRequest = (res, message) => res.status(400).send(message);
const notFound = (res, message) => res.status(404).send(message);

const withErrorHandling = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).send(error instanceof Error ? error.message : "Internal server error");
  }
};

const buildOrderClause = (query, allowedColumns, fallbackColumn, fallbackDir = "ASC") => {
  const requestedSort = typeof query._sort === "string" ? query._sort : fallbackColumn;
  const sortColumn = allowedColumns[requestedSort] ?? allowedColumns[fallbackColumn] ?? Object.values(allowedColumns)[0];

  const requestedOrder = typeof query._order === "string" ? query._order.toUpperCase() : fallbackDir;
  const order = requestedOrder === "DESC" ? "DESC" : "ASC";

  return ` ORDER BY ${sortColumn} ${order}`;
};

const rowToCategory = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
});

const rowToCustomer = (row) => ({
  id: row.id,
  customerCode: row.customer_code,
  companyName: row.company_name,
  contactPerson: row.contact_person,
  country: row.country,
  name: row.name,
  email: row.email,
  phone: row.phone,
  address: row.address,
  status: row.status,
  createdAt: row.created_at,
});

const rowToProduct = (row) => ({
  id: row.id,
  name: row.name,
  sku: row.sku,
  categoryId: row.category_id,
  unitPrice: row.unit_price,
  fixedCostPrice: row.fixed_cost_price,
  currency: row.currency,
  unit: row.unit,
  stockQuantity: row.stock_quantity,
  reorderLevel: row.reorder_level,
  description: row.description,
  status: row.status,
});

const rowToOrder = (row) => ({
  id: row.id,
  orderNumber: row.order_number,
  customerId: row.customer_id,
  orderDate: row.order_date,
  status: row.status,
  currency: row.currency,
  totalAmount: row.total_amount,
  totalDiscount: row.total_discount,
  totalCost: row.total_cost,
  estimatedProfit: row.estimated_profit,
  itemCount: row.item_count,
});

const rowToOrderItem = (row) => ({
  id: row.id,
  orderId: row.order_id,
  productId: row.product_id,
  productSku: row.product_sku,
  productNameSnapshot: row.product_name_snapshot,
  quantity: row.quantity,
  unit: row.unit,
  currency: row.currency,
  sellingPriceSnapshot: row.selling_price_snapshot,
  fixedCostSnapshot: row.fixed_cost_snapshot,
  discountType: row.discount_type,
  discountValue: row.discount_value,
  discountAmount: row.discount_amount,
  lineSubtotal: row.line_subtotal,
  lineTotal: row.line_total,
  lineProfit: row.line_profit,
});

const rowToDiscount = (row) => ({
  id: row.id,
  name: row.name,
  customerId: row.customer_id,
  scopeType: row.scope_type,
  scopeId: row.scope_id,
  discountType: row.discount_type,
  value: row.value,
  currency: row.currency,
  startDate: row.start_date,
  endDate: row.end_date,
  status: row.status,
});

const rowToUser = (row) => ({
  id: row.id,
  username: row.username,
  password: row.password,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  role: row.role,
  status: row.status,
  createdAt: row.created_at,
});

const rowToSupplier = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  address: row.address,
  status: row.status,
});

const rowToWarehouse = (row) => ({
  id: row.id,
  name: row.name,
  location: row.location,
});

const rowToWarehouseProduct = (row) => ({
  id: row.id,
  warehouseId: row.warehouse_id,
  productId: row.product_id,
  supplierId: row.supplier_id,
  stockQuantity: row.stock_quantity,
  reorderLevel: row.reorder_level,
  supplierPrice: row.supplier_price,
  supplierDiscount: row.supplier_discount,
});

let db;

app.get(
  "/health",
  withErrorHandling(async (_req, res) => {
    const counts = await db.get("SELECT COUNT(*) AS customers FROM customers");
    res.json({ ok: true, customers: counts?.customers ?? 0 });
  }),
);

app.get(
  "/categories",
  withErrorHandling(async (_req, res) => {
    const rows = await db.all("SELECT id, name, description FROM categories ORDER BY name ASC");
    res.json(rows.map(rowToCategory));
  }),
);

app.get(
  "/productCategories",
  withErrorHandling(async (_req, res) => {
    const rows = await db.all("SELECT id, name, description FROM categories ORDER BY name ASC");
    res.json(rows.map(rowToCategory));
  }),
);

app.post(
  "/categories",
  withErrorHandling(async (req, res) => {
    const { id, name, description } = req.body ?? {};
    if (!id || !name) return badRequest(res, "id and name are required");

    await db.run(
      "INSERT INTO categories (id, name, description) VALUES (?, ?, ?)",
      id,
      name,
      description ?? null,
    );

    const row = await db.get("SELECT id, name, description FROM categories WHERE id = ?", id);
    res.status(201).json(rowToCategory(row));
  }),
);

app.get(
  "/products",
  withErrorHandling(async (req, res) => {
    const where = [];
    const params = [];

    if (typeof req.query.categoryId === "string" && req.query.categoryId) {
      where.push("category_id = ?");
      params.push(req.query.categoryId);
    }

    if (typeof req.query.q === "string" && req.query.q) {
      where.push("(LOWER(name) LIKE ? OR LOWER(sku) LIKE ?)");
      const like = `%${req.query.q.toLowerCase()}%`;
      params.push(like, like);
    }

    const whereClause = where.length ? ` WHERE ${where.join(" AND ")}` : "";
    const orderClause = buildOrderClause(req.query, {
      name: "name",
      unitPrice: "unit_price",
      stockQuantity: "stock_quantity",
      createdAt: "id",
    }, "name", "ASC");

    const rows = await db.all(
      `SELECT id, name, sku, category_id, unit_price, fixed_cost_price, currency, unit, stock_quantity, reorder_level, description, status
       FROM products${whereClause}${orderClause}`,
      ...params,
    );

    res.json(rows.map(rowToProduct));
  }),
);

app.patch(
  "/products/:id",
  withErrorHandling(async (req, res) => {
    const current = await db.get("SELECT * FROM products WHERE id = ?", req.params.id);
    if (!current) return notFound(res, "Product not found");

    const next = {
      stock_quantity: req.body.stockQuantity ?? current.stock_quantity,
      unit_price: req.body.unitPrice ?? current.unit_price,
      fixed_cost_price: req.body.fixedCostPrice ?? current.fixed_cost_price,
      status: req.body.status ?? current.status,
      category_id: req.body.categoryId ?? current.category_id,
      name: req.body.name ?? current.name,
      sku: req.body.sku ?? current.sku,
      currency: req.body.currency ?? current.currency,
      unit: req.body.unit ?? current.unit,
      reorder_level: req.body.reorderLevel ?? current.reorder_level,
      description: req.body.description ?? current.description,
    };

    await db.run(
      `UPDATE products
       SET name = ?, sku = ?, category_id = ?, unit_price = ?, fixed_cost_price = ?, currency = ?, unit = ?,
           stock_quantity = ?, reorder_level = ?, description = ?, status = ?
       WHERE id = ?`,
      next.name,
      next.sku,
      next.category_id,
      Number(next.unit_price),
      Number(next.fixed_cost_price),
      next.currency,
      next.unit,
      Number(next.stock_quantity),
      Number(next.reorder_level),
      next.description,
      next.status,
      req.params.id,
    );

    const updated = await db.get("SELECT * FROM products WHERE id = ?", req.params.id);
    res.json(rowToProduct(updated));
  }),
);

app.get(
  "/customers",
  withErrorHandling(async (req, res) => {
    const orderClause = buildOrderClause(req.query, {
      companyName: "company_name",
      createdAt: "created_at",
      name: "name",
    }, "companyName", "ASC");

    const rows = await db.all(
      `SELECT id, customer_code, company_name, contact_person, country, name, email, phone, address, status, created_at
       FROM customers${orderClause}`,
    );

    res.json(rows.map(rowToCustomer));
  }),
);

app.get(
  "/customers/:id",
  withErrorHandling(async (req, res) => {
    const row = await db.get(
      `SELECT id, customer_code, company_name, contact_person, country, name, email, phone, address, status, created_at
       FROM customers WHERE id = ?`,
      req.params.id,
    );

    if (!row) return notFound(res, "Customer not found");
    res.json(rowToCustomer(row));
  }),
);

app.get(
  "/orders",
  withErrorHandling(async (req, res) => {
    const where = [];
    const params = [];

    if (typeof req.query.customerId === "string" && req.query.customerId) {
      where.push("customer_id = ?");
      params.push(req.query.customerId);
    }

    if (typeof req.query.status === "string" && req.query.status) {
      where.push("status = ?");
      params.push(req.query.status);
    }

    const whereClause = where.length ? ` WHERE ${where.join(" AND ")}` : "";
    const orderClause = buildOrderClause(req.query, {
      orderDate: "order_date",
      totalAmount: "total_amount",
      status: "status",
      orderNumber: "order_number",
    }, "orderDate", "DESC");

    const rows = await db.all(
      `SELECT id, order_number, customer_id, order_date, status, currency, total_amount, total_discount, total_cost, estimated_profit, item_count
       FROM orders${whereClause}${orderClause}`,
      ...params,
    );

    res.json(rows.map(rowToOrder));
  }),
);

app.post(
  "/orders",
  withErrorHandling(async (req, res) => {
    const payload = req.body ?? {};
    if (!payload.id || !payload.customerId) {
      return badRequest(res, "id and customerId are required");
    }

    await db.run(
      `INSERT INTO orders (id, order_number, customer_id, order_date, status, currency, total_amount, total_discount, total_cost, estimated_profit, item_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      payload.id,
      payload.orderNumber ?? null,
      payload.customerId,
      payload.orderDate ?? null,
      payload.status ?? "draft",
      payload.currency ?? "NOK",
      Number(payload.totalAmount ?? 0),
      Number(payload.totalDiscount ?? 0),
      Number(payload.totalCost ?? 0),
      Number(payload.estimatedProfit ?? 0),
      Number(payload.itemCount ?? 0),
    );

    const row = await db.get("SELECT * FROM orders WHERE id = ?", payload.id);
    res.status(201).json(rowToOrder(row));
  }),
);

app.patch(
  "/orders/:id",
  withErrorHandling(async (req, res) => {
    const current = await db.get("SELECT * FROM orders WHERE id = ?", req.params.id);
    if (!current) return notFound(res, "Order not found");

    const next = {
      order_number: req.body.orderNumber ?? current.order_number,
      customer_id: req.body.customerId ?? current.customer_id,
      order_date: req.body.orderDate ?? current.order_date,
      status: req.body.status ?? current.status,
      currency: req.body.currency ?? current.currency,
      total_amount: req.body.totalAmount ?? current.total_amount,
      total_discount: req.body.totalDiscount ?? current.total_discount,
      total_cost: req.body.totalCost ?? current.total_cost,
      estimated_profit: req.body.estimatedProfit ?? current.estimated_profit,
      item_count: req.body.itemCount ?? current.item_count,
    };

    await db.run(
      `UPDATE orders
       SET order_number = ?, customer_id = ?, order_date = ?, status = ?, currency = ?,
           total_amount = ?, total_discount = ?, total_cost = ?, estimated_profit = ?, item_count = ?
       WHERE id = ?`,
      next.order_number,
      next.customer_id,
      next.order_date,
      next.status,
      next.currency,
      Number(next.total_amount),
      Number(next.total_discount),
      Number(next.total_cost),
      Number(next.estimated_profit),
      Number(next.item_count),
      req.params.id,
    );

    const row = await db.get("SELECT * FROM orders WHERE id = ?", req.params.id);
    res.json(rowToOrder(row));
  }),
);

app.delete(
  "/orders/:id",
  withErrorHandling(async (req, res) => {
    const result = await db.run("DELETE FROM orders WHERE id = ?", req.params.id);
    if ((result?.changes ?? 0) === 0) return notFound(res, "Order not found");
    res.status(204).end();
  }),
);

app.get(
  "/orderItems",
  withErrorHandling(async (req, res) => {
    const where = [];
    const params = [];

    if (typeof req.query.orderId === "string" && req.query.orderId) {
      where.push("order_id = ?");
      params.push(req.query.orderId);
    }

    const whereClause = where.length ? ` WHERE ${where.join(" AND ")}` : "";
    const orderClause = buildOrderClause(req.query, {
      id: "id",
      quantity: "quantity",
      lineTotal: "line_total",
      lineProfit: "line_profit",
    }, "id", "ASC");

    const rows = await db.all(
      `SELECT id, order_id, product_id, product_sku, product_name_snapshot, quantity, unit, currency,
              selling_price_snapshot, fixed_cost_snapshot, discount_type, discount_value, discount_amount,
              line_subtotal, line_total, line_profit
       FROM order_product${whereClause}${orderClause}`,
      ...params,
    );

    res.json(rows.map(rowToOrderItem));
  }),
);

app.post(
  "/orderItems",
  withErrorHandling(async (req, res) => {
    const payload = req.body ?? {};
    if (!payload.id || !payload.orderId || !payload.productId) {
      return badRequest(res, "id, orderId and productId are required");
    }

    await db.run(
      `INSERT INTO order_product (
        id, order_id, product_id, product_sku, product_name_snapshot, quantity, unit, currency,
        selling_price_snapshot, fixed_cost_snapshot, discount_type, discount_value, discount_amount,
        line_subtotal, line_total, line_profit
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      payload.id,
      payload.orderId,
      payload.productId,
      payload.productSku ?? null,
      payload.productNameSnapshot ?? null,
      Number(payload.quantity ?? 0),
      payload.unit ?? null,
      payload.currency ?? "NOK",
      Number(payload.sellingPriceSnapshot ?? 0),
      Number(payload.fixedCostSnapshot ?? 0),
      payload.discountType ?? "percentage",
      Number(payload.discountValue ?? 0),
      Number(payload.discountAmount ?? 0),
      Number(payload.lineSubtotal ?? 0),
      Number(payload.lineTotal ?? 0),
      Number(payload.lineProfit ?? 0),
    );

    const row = await db.get("SELECT * FROM order_product WHERE id = ?", payload.id);
    res.status(201).json(rowToOrderItem(row));
  }),
);

app.delete(
  "/orderItems/:id",
  withErrorHandling(async (req, res) => {
    const result = await db.run("DELETE FROM order_product WHERE id = ?", req.params.id);
    if ((result?.changes ?? 0) === 0) return notFound(res, "Order item not found");
    res.status(204).end();
  }),
);

app.get(
  "/discounts",
  withErrorHandling(async (req, res) => {
    const where = [];
    const params = [];

    if (typeof req.query.customerId === "string" && req.query.customerId) {
      where.push("customer_id = ?");
      params.push(req.query.customerId);
    }

    if (typeof req.query.status === "string" && req.query.status) {
      where.push("status = ?");
      params.push(req.query.status);
    }

    const whereClause = where.length ? ` WHERE ${where.join(" AND ")}` : "";
    const orderClause = buildOrderClause(req.query, {
      startDate: "start_date",
      endDate: "end_date",
      status: "status",
      name: "name",
    }, "startDate", "DESC");

    const rows = await db.all(
      `SELECT id, name, customer_id, scope_type, scope_id, discount_type, value, currency, start_date, end_date, status
       FROM product_customer${whereClause}${orderClause}`,
      ...params,
    );

    res.json(rows.map(rowToDiscount));
  }),
);

app.post(
  "/discounts",
  withErrorHandling(async (req, res) => {
    const payload = req.body ?? {};
    if (!payload.id || !payload.customerId || !payload.scopeType || !payload.scopeId) {
      return badRequest(res, "id, customerId, scopeType and scopeId are required");
    }

    const productId = payload.scopeType === "product" ? payload.scopeId : null;
    const categoryId = payload.scopeType === "category" ? payload.scopeId : null;

    await db.run(
      `INSERT INTO product_customer (
        id, name, customer_id, product_id, category_id, scope_type, scope_id,
        discount_type, value, currency, start_date, end_date, status, discount_percent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      payload.id,
      payload.name ?? null,
      payload.customerId,
      productId,
      categoryId,
      payload.scopeType,
      payload.scopeId,
      payload.discountType ?? "percentage",
      Number(payload.value ?? 0),
      payload.currency ?? "NOK",
      payload.startDate ?? null,
      payload.endDate ?? null,
      payload.status ?? "active",
      payload.discountType === "percentage" ? Number(payload.value ?? 0) : null,
    );

    const row = await db.get(
      "SELECT id, name, customer_id, scope_type, scope_id, discount_type, value, currency, start_date, end_date, status FROM product_customer WHERE id = ?",
      payload.id,
    );

    res.status(201).json(rowToDiscount(row));
  }),
);

app.patch(
  "/discounts/:id",
  withErrorHandling(async (req, res) => {
    const current = await db.get("SELECT * FROM product_customer WHERE id = ?", req.params.id);
    if (!current) return notFound(res, "Discount not found");

    const nextScopeType = req.body.scopeType ?? current.scope_type;
    const nextScopeId = req.body.scopeId ?? current.scope_id;

    const nextProductId = nextScopeType === "product" ? nextScopeId : null;
    const nextCategoryId = nextScopeType === "category" ? nextScopeId : null;

    const next = {
      name: req.body.name ?? current.name,
      customer_id: req.body.customerId ?? current.customer_id,
      scope_type: nextScopeType,
      scope_id: nextScopeId,
      discount_type: req.body.discountType ?? current.discount_type,
      value: req.body.value ?? current.value,
      currency: req.body.currency ?? current.currency,
      start_date: req.body.startDate ?? current.start_date,
      end_date: req.body.endDate ?? current.end_date,
      status: req.body.status ?? current.status,
    };

    await db.run(
      `UPDATE product_customer
       SET name = ?, customer_id = ?, product_id = ?, category_id = ?, scope_type = ?, scope_id = ?,
           discount_type = ?, value = ?, currency = ?, start_date = ?, end_date = ?, status = ?, discount_percent = ?
       WHERE id = ?`,
      next.name,
      next.customer_id,
      nextProductId,
      nextCategoryId,
      next.scope_type,
      next.scope_id,
      next.discount_type,
      Number(next.value),
      next.currency,
      next.start_date,
      next.end_date,
      next.status,
      next.discount_type === "percentage" ? Number(next.value) : null,
      req.params.id,
    );

    const row = await db.get(
      "SELECT id, name, customer_id, scope_type, scope_id, discount_type, value, currency, start_date, end_date, status FROM product_customer WHERE id = ?",
      req.params.id,
    );

    res.json(rowToDiscount(row));
  }),
);

app.get(
  "/users",
  withErrorHandling(async (req, res) => {
    const orderClause = buildOrderClause(req.query, {
      createdAt: "created_at",
      username: "username",
      role: "role",
    }, "createdAt", "DESC");

    const rows = await db.all(
      `SELECT id, username, password, first_name, last_name, email, role, status, created_at
       FROM users${orderClause}`,
    );

    res.json(rows.map(rowToUser));
  }),
);

// Optional debug endpoints for ER-supporting tables.
app.get(
  "/suppliers",
  withErrorHandling(async (_req, res) => {
    const rows = await db.all("SELECT id, name, email, phone, address, status FROM suppliers ORDER BY name ASC");
    res.json(rows.map(rowToSupplier));
  }),
);

app.get(
  "/warehouses",
  withErrorHandling(async (_req, res) => {
    const rows = await db.all("SELECT id, name, location FROM warehouses ORDER BY name ASC");
    res.json(rows.map(rowToWarehouse));
  }),
);

app.get(
  "/warehouseProducts",
  withErrorHandling(async (req, res) => {
    const where = [];
    const params = [];

    if (typeof req.query.productId === "string" && req.query.productId) {
      where.push("product_id = ?");
      params.push(req.query.productId);
    }

    if (typeof req.query.warehouseId === "string" && req.query.warehouseId) {
      where.push("warehouse_id = ?");
      params.push(req.query.warehouseId);
    }

    const whereClause = where.length ? ` WHERE ${where.join(" AND ")}` : "";
    const rows = await db.all(
      `SELECT id, warehouse_id, product_id, supplier_id, stock_quantity, reorder_level, supplier_price, supplier_discount
       FROM warehouse_product${whereClause} ORDER BY id ASC`,
      ...params,
    );

    res.json(rows.map(rowToWarehouseProduct));
  }),
);

async function start() {
  db = await openDb();
  await initializeSchema(db);
  const result = await seedDatabase(db, { forceReset: false });

  app.listen(PORT, () => {
    console.log(`Backend server listening on http://localhost:${PORT}`);
    console.log(result.seeded ? "Database seeded from mock/db.json" : "Database already initialized; keeping persisted data");
  });
}

start().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
