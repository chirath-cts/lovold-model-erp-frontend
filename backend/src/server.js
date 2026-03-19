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

const numberValue = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const integerValue = (value, fallback = 0) => {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isInteger(parsed) ? parsed : fallback;
};

const isNonNegativeNumber = (value) => Number.isFinite(Number(value)) && Number(value) >= 0;
const isNonNegativeInteger = (value) => Number.isInteger(Number(value)) && Number(value) >= 0;

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const dateOnly = (value) => {
  const date = parseDate(value);
  return date ? date.toISOString().slice(0, 10) : null;
};

const statusFromDates = (startDate, endDate, isActive) => {
  if (!isActive) return "expired";
  const now = new Date();
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (start && start.getTime() > now.getTime()) return "future";
  if (end && end.getTime() < now.getTime()) return "expired";
  return "active";
};

const buildOrderClause = (query, allowedColumns, fallbackColumn, fallbackDir = "ASC") => {
  const requestedSort = typeof query._sort === "string" ? query._sort : fallbackColumn;
  const sortColumn = allowedColumns[requestedSort] ?? allowedColumns[fallbackColumn] ?? Object.values(allowedColumns)[0];

  const requestedOrder = typeof query._order === "string" ? query._order.toUpperCase() : fallbackDir;
  const order = requestedOrder === "DESC" ? "DESC" : "ASC";

  return ` ORDER BY ${sortColumn} ${order}`;
};

const sortArrayBy = (rows, sortBy, sortOrder = "asc") => {
  const order = sortOrder.toLowerCase() === "desc" ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = a[sortBy];
    const bv = b[sortBy];

    if (av === bv) return 0;
    if (av === null || av === undefined) return -1 * order;
    if (bv === null || bv === undefined) return 1 * order;

    if (typeof av === "number" && typeof bv === "number") {
      return av > bv ? order : -order;
    }

    return String(av).localeCompare(String(bv)) * order;
  });
};

const parseDiscountId = (id) => {
  if (typeof id !== "string" || !id.includes("__")) return null;
  const [customerId, productId] = id.split("__");
  if (!customerId || !productId) return null;
  return { customerId, productId };
};

const PRIMARY_SUPPLIER_JOIN_SQL = `
LEFT JOIN supplier_product sp
  ON sp.product_id = p.id
 AND sp.id = (
   SELECT sp2.id
   FROM supplier_product sp2
   WHERE sp2.product_id = p.id
   ORDER BY COALESCE(sp2.is_primary_supplier, 0) DESC, sp2.id ASC
   LIMIT 1
 )
`;

const rowToCategory = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
});

const rowToCustomer = (row) => ({
  id: row.id,
  customerCode: row.customer_code,
  companyName: row.name,
  contactPerson: row.name,
  country: "N/A",
  name: row.name,
  email: row.email,
  phone: row.phone,
  address: row.address,
  status: row.status,
  createdAt: null,
});

const rowToProduct = (row) => ({
  id: row.id,
  name: row.name,
  sku: row.sku,
  categoryId: row.category_id,
  imageUrl: row.image_url ?? null,
  unitPrice: numberValue(row.base_price, 0),
  fixedCostPrice: numberValue(row.purchase_price ?? row.base_price, 0),
  currency: "NOK",
  unit: row.unit,
  stockQuantity: integerValue(row.stock_quantity, 0),
  reorderLevel: integerValue(row.reorder_level, 0),
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
  totalAmount: numberValue(row.grand_total, 0),
  totalDiscount: numberValue(row.discount_total, 0),
  totalCost: numberValue(row.cost_total, 0),
  estimatedProfit: numberValue(row.profit_total, 0),
  itemCount: integerValue(row.item_count, 0),
});

const rowToOrderItem = (row) => {
  const discountPercent = numberValue(row.discount_percent, 0);
  const discountAmount = numberValue(row.discount_amount, 0);

  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    productSku: row.product_sku,
    productNameSnapshot: row.product_name,
    quantity: numberValue(row.quantity, 0),
    unit: row.product_unit,
    currency: "NOK",
    sellingPriceSnapshot: numberValue(row.unit_price, 0),
    fixedCostSnapshot: numberValue(row.unit_cost_at_sale, 0),
    discountType: discountPercent > 0 ? "percentage" : "fixed",
    discountValue: discountPercent > 0 ? discountPercent : discountAmount,
    discountAmount,
    lineSubtotal: numberValue(row.line_subtotal, 0),
    lineTotal: numberValue(row.line_total, 0),
    lineProfit: numberValue(row.profit_amount, 0),
  };
};

const rowToDiscount = (row) => ({
  id: `${row.customer_id}__${row.product_id}`,
  name: `${row.product_name ?? "Product"} ${numberValue(row.discount_percent, 0)}%`,
  customerId: row.customer_id,
  scopeType: "product",
  scopeId: row.product_id,
  discountType: "percentage",
  value: numberValue(row.discount_percent, 0),
  currency: "NOK",
  startDate: dateOnly(row.start_date),
  endDate: dateOnly(row.end_date),
  status: statusFromDates(row.start_date, row.end_date, !!row.is_active),
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
  createdAt: null,
});

const toSafeUser = (row) => {
  const { password, ...user } = rowToUser(row);
  return user;
};

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
  stockQuantity: integerValue(row.stock_quantity, 0),
  reorderLevel: integerValue(row.reorder_level, 0),
  supplierPrice: numberValue(row.supplier_price, 0),
  supplierDiscount: numberValue(row.supplier_discount, 0),
});

let db;

async function getPrimaryWarehouseId() {
  const row = await db.get("SELECT id FROM warehouses ORDER BY id ASC LIMIT 1");
  return row?.id ?? null;
}

async function ensureInventoryRow(productId) {
  const existing = await db.get("SELECT id FROM inventory WHERE product_id = ? ORDER BY id ASC LIMIT 1", productId);
  if (existing) return existing.id;

  const warehouseId = await getPrimaryWarehouseId();
  if (!warehouseId) return null;

  const inventoryId = `inv-${productId}`;
  await db.run(
    `INSERT OR IGNORE INTO inventory (
      id, warehouse_id, product_id, stock_quantity, reorder_level, reserved_quantity, last_stock_update_at
    ) VALUES (?, ?, ?, 0, 0, 0, ?)`,
    inventoryId,
    warehouseId,
    productId,
    new Date().toISOString(),
  );

  const created = await db.get("SELECT id FROM inventory WHERE product_id = ? ORDER BY id ASC LIMIT 1", productId);
  return created?.id ?? null;
}

async function getProductById(productId) {
  return db.get(
    `SELECT p.id, p.name, p.sku, p.category_id, p.description, p.image_url, p.base_price, p.unit, p.status, sp.purchase_price,
            COALESCE(SUM(i.stock_quantity), 0) AS stock_quantity,
            COALESCE(SUM(i.reorder_level), 0) AS reorder_level
     FROM products p
     LEFT JOIN inventory i ON i.product_id = p.id
     ${PRIMARY_SUPPLIER_JOIN_SQL}
     WHERE p.id = ?
     GROUP BY p.id, p.name, p.sku, p.category_id, p.description, p.image_url, p.base_price, p.unit, p.status, sp.purchase_price`,
    productId,
  );
}

async function getOrderById(orderId) {
  return db.get(
    `SELECT o.id, o.order_number, o.customer_id, o.order_date, o.status, o.currency,
            o.subtotal, o.discount_total, o.cost_total, o.profit_total, o.grand_total,
            COALESCE(i.item_count, 0) AS item_count
     FROM orders o
     LEFT JOIN (
       SELECT order_id, COUNT(*) AS item_count
       FROM order_product
       GROUP BY order_id
     ) i ON i.order_id = o.id
     WHERE o.id = ?`,
    orderId,
  );
}

async function getOrderItemById(orderItemId) {
  return db.get(
    `SELECT op.id, op.order_id, op.product_id, op.quantity, op.unit_price, op.line_subtotal,
            op.discount_percent, op.discount_amount, op.line_total, op.unit_cost_at_sale, op.profit_amount,
            p.sku AS product_sku, p.name AS product_name, p.unit AS product_unit
     FROM order_product op
     LEFT JOIN products p ON p.id = op.product_id
     WHERE op.id = ?`,
    orderItemId,
  );
}

async function getDiscountByKeys(customerId, productId) {
  return db.get(
    `SELECT cp.customer_id, cp.product_id, cp.discount_percent, cp.start_date, cp.end_date, cp.is_active,
            p.name AS product_name
     FROM customer_product cp
     LEFT JOIN products p ON p.id = cp.product_id
     WHERE cp.customer_id = ? AND cp.product_id = ?`,
    customerId,
    productId,
  );
}

const resolveDiscountPercent = (discountType, value, basePrice) => {
  const normalizedType = discountType === "fixed" ? "fixed" : "percentage";
  const normalizedValue = numberValue(value, 0);

  if (normalizedType === "percentage") return normalizedValue;
  if (basePrice <= 0) return 0;
  return (normalizedValue / basePrice) * 100;
};

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

    await db.run("INSERT INTO categories (id, name, description) VALUES (?, ?, ?)", id, name, description ?? null);

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
      where.push("p.category_id = ?");
      params.push(req.query.categoryId);
    }

    if (typeof req.query.q === "string" && req.query.q) {
      where.push("(LOWER(p.name) LIKE ? OR LOWER(COALESCE(p.sku, '')) LIKE ?)");
      const like = `%${req.query.q.toLowerCase()}%`;
      params.push(like, like);
    }

    const whereClause = where.length ? ` WHERE ${where.join(" AND ")}` : "";
    const orderClause = buildOrderClause(
      req.query,
      {
        name: "p.name",
        unitPrice: "p.base_price",
        stockQuantity: "stock_quantity",
        status: "p.status",
        createdAt: "p.id",
      },
      "name",
      "ASC",
    );

    const rows = await db.all(
      `SELECT p.id, p.name, p.sku, p.category_id, p.description, p.image_url, p.base_price, p.unit, p.status, sp.purchase_price,
              COALESCE(SUM(i.stock_quantity), 0) AS stock_quantity,
              COALESCE(SUM(i.reorder_level), 0) AS reorder_level
       FROM products p
       LEFT JOIN inventory i ON i.product_id = p.id
       ${PRIMARY_SUPPLIER_JOIN_SQL}
       ${whereClause}
       GROUP BY p.id, p.name, p.sku, p.category_id, p.description, p.image_url, p.base_price, p.unit, p.status, sp.purchase_price${orderClause}`,
      ...params,
    );

    res.json(rows.map(rowToProduct));
  }),
);

app.post(
  "/products",
  withErrorHandling(async (req, res) => {
    const { id, name, categoryId, unit } = req.body ?? {};
    if (!id || !name || !categoryId || !unit) {
      return badRequest(res, "id, name, categoryId, and unit are required");
    }

    if (!isNonNegativeNumber(req.body.unitPrice ?? 0)) {
      return badRequest(res, "unitPrice must be a non-negative number");
    }

    if (!isNonNegativeNumber(req.body.fixedCostPrice ?? 0)) {
      return badRequest(res, "fixedCostPrice must be a non-negative number");
    }

    if (!isNonNegativeInteger(req.body.stockQuantity ?? 0)) {
      return badRequest(res, "stockQuantity must be a non-negative integer");
    }

    if (!isNonNegativeInteger(req.body.reorderLevel ?? 0)) {
      return badRequest(res, "reorderLevel must be a non-negative integer");
    }

    if (
      req.body.imageUrl !== undefined &&
      req.body.imageUrl !== null &&
      typeof req.body.imageUrl !== "string"
    ) {
      return badRequest(res, "imageUrl must be a string or null");
    }

    if (
      req.body.image_url !== undefined &&
      req.body.image_url !== null &&
      typeof req.body.image_url !== "string"
    ) {
      return badRequest(res, "image_url must be a string or null");
    }

    const category = await db.get("SELECT id FROM categories WHERE id = ?", categoryId);
    if (!category) return badRequest(res, "Invalid categoryId");

    const basePrice = numberValue(req.body.unitPrice ?? req.body.fixedCostPrice, 0);
    const stockQuantity = integerValue(req.body.stockQuantity, 0);
    const reorderLevel = integerValue(req.body.reorderLevel, 0);
    const imageUrl = req.body.imageUrl ?? req.body.image_url ?? null;

    await db.run(
      `INSERT INTO products (id, category_id, name, sku, description, image_url, base_price, unit, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      categoryId,
      name,
      typeof req.body.sku === "string" ? req.body.sku : "",
      typeof req.body.description === "string" ? req.body.description : "",
      imageUrl,
      basePrice,
      unit,
      req.body.status === "inactive" ? "inactive" : "active",
    );

    const warehouseId = await getPrimaryWarehouseId();
    if (warehouseId) {
      await db.run(
        `INSERT INTO inventory (id, warehouse_id, product_id, stock_quantity, reorder_level, reserved_quantity, last_stock_update_at)
         VALUES (?, ?, ?, ?, ?, 0, ?)`,
        `inv-${id}`,
        warehouseId,
        id,
        stockQuantity,
        reorderLevel,
        new Date().toISOString(),
      );
    }

    const created = await getProductById(id);
    res.status(201).json(rowToProduct(created));
  }),
);

app.patch(
  "/products/:id",
  withErrorHandling(async (req, res) => {
    const current = await db.get("SELECT * FROM products WHERE id = ?", req.params.id);
    if (!current) return notFound(res, "Product not found");

    if (req.body.categoryId !== undefined) {
      if (typeof req.body.categoryId !== "string" || !req.body.categoryId) {
        return badRequest(res, "categoryId must be a non-empty string");
      }
      const category = await db.get("SELECT id FROM categories WHERE id = ?", req.body.categoryId);
      if (!category) return badRequest(res, "Invalid categoryId");
    }

    if (req.body.unitPrice !== undefined && !isNonNegativeNumber(req.body.unitPrice)) {
      return badRequest(res, "unitPrice must be a non-negative number");
    }

    if (req.body.fixedCostPrice !== undefined && !isNonNegativeNumber(req.body.fixedCostPrice)) {
      return badRequest(res, "fixedCostPrice must be a non-negative number");
    }

    if (req.body.stockQuantity !== undefined && !isNonNegativeInteger(req.body.stockQuantity)) {
      return badRequest(res, "stockQuantity must be a non-negative integer");
    }

    if (req.body.reorderLevel !== undefined && !isNonNegativeInteger(req.body.reorderLevel)) {
      return badRequest(res, "reorderLevel must be a non-negative integer");
    }

    const hasImageUrlField = Object.prototype.hasOwnProperty.call(req.body, "imageUrl");
    const hasImageUrlSnakeField = Object.prototype.hasOwnProperty.call(req.body, "image_url");
    const hasImageUrlUpdate = hasImageUrlField || hasImageUrlSnakeField;
    const imageUrlInput = hasImageUrlField ? req.body.imageUrl : req.body.image_url;
    if (hasImageUrlUpdate && imageUrlInput !== null && typeof imageUrlInput !== "string") {
      return badRequest(res, "imageUrl must be a string or null");
    }

    const next = {
      category_id: req.body.categoryId ?? current.category_id,
      name: req.body.name ?? current.name,
      sku: req.body.sku ?? current.sku,
      description: req.body.description ?? current.description,
      image_url: hasImageUrlUpdate ? imageUrlInput : current.image_url,
      base_price:
        req.body.unitPrice !== undefined
          ? numberValue(req.body.unitPrice, current.base_price)
          : req.body.fixedCostPrice !== undefined
            ? numberValue(req.body.fixedCostPrice, current.base_price)
            : current.base_price,
      unit: req.body.unit ?? current.unit,
      status: req.body.status ?? current.status,
    };

    await db.run(
      `UPDATE products
       SET category_id = ?, name = ?, sku = ?, description = ?, image_url = ?, base_price = ?, unit = ?, status = ?
       WHERE id = ?`,
      next.category_id,
      next.name,
      next.sku,
      next.description,
      next.image_url,
      numberValue(next.base_price, 0),
      next.unit,
      next.status,
      req.params.id,
    );

    if (req.body.stockQuantity !== undefined || req.body.reorderLevel !== undefined) {
      const inventoryRowId = await ensureInventoryRow(req.params.id);
      if (!inventoryRowId) {
        return badRequest(res, "No warehouse available to maintain inventory");
      }

      if (req.body.stockQuantity !== undefined) {
        await db.run("UPDATE inventory SET stock_quantity = 0 WHERE product_id = ?", req.params.id);
        await db.run("UPDATE inventory SET stock_quantity = ?, last_stock_update_at = ? WHERE id = ?", req.body.stockQuantity, new Date().toISOString(), inventoryRowId);
      }

      if (req.body.reorderLevel !== undefined) {
        await db.run("UPDATE inventory SET reorder_level = 0 WHERE product_id = ?", req.params.id);
        await db.run("UPDATE inventory SET reorder_level = ?, last_stock_update_at = ? WHERE id = ?", req.body.reorderLevel, new Date().toISOString(), inventoryRowId);
      }
    }

    const updated = await getProductById(req.params.id);
    res.json(rowToProduct(updated));
  }),
);

app.get(
  "/customers",
  withErrorHandling(async (req, res) => {
    const orderClause = buildOrderClause(
      req.query,
      {
        companyName: "name",
        createdAt: "id",
        name: "name",
      },
      "companyName",
      "ASC",
    );

    const rows = await db.all(
      `SELECT id, customer_code, name, email, phone, address, status
       FROM customers${orderClause}`,
    );

    res.json(rows.map(rowToCustomer));
  }),
);

app.get(
  "/customers/:id",
  withErrorHandling(async (req, res) => {
    const row = await db.get(
      `SELECT id, customer_code, name, email, phone, address, status
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
      where.push("o.customer_id = ?");
      params.push(req.query.customerId);
    }

    if (typeof req.query.status === "string" && req.query.status) {
      where.push("o.status = ?");
      params.push(req.query.status);
    }

    const whereClause = where.length ? ` WHERE ${where.join(" AND ")}` : "";
    const orderClause = buildOrderClause(
      req.query,
      {
        orderDate: "o.order_date",
        totalAmount: "o.grand_total",
        status: "o.status",
        orderNumber: "o.order_number",
      },
      "orderDate",
      "DESC",
    );

    const rows = await db.all(
      `SELECT o.id, o.order_number, o.customer_id, o.order_date, o.status, o.currency,
              o.subtotal, o.discount_total, o.cost_total, o.profit_total, o.grand_total,
              COALESCE(i.item_count, 0) AS item_count
       FROM orders o
       LEFT JOIN (
         SELECT order_id, COUNT(*) AS item_count
         FROM order_product
         GROUP BY order_id
       ) i ON i.order_id = o.id${whereClause}${orderClause}`,
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

    const customer = await db.get("SELECT id FROM customers WHERE id = ?", payload.customerId);
    if (!customer) return badRequest(res, "Invalid customerId");

    const grandTotal = numberValue(payload.grandTotal ?? payload.totalAmount, 0);
    const discountTotal = numberValue(payload.discountTotal ?? payload.totalDiscount, 0);

    await db.run(
      `INSERT INTO orders (
        id, order_number, customer_id, order_date, status, currency,
        subtotal, discount_total, cost_total, profit_total, grand_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      payload.id,
      payload.orderNumber ?? null,
      payload.customerId,
      payload.orderDate ?? null,
      payload.status ?? "draft",
      payload.currency ?? "NOK",
      numberValue(payload.subtotal, grandTotal + discountTotal),
      discountTotal,
      numberValue(payload.costTotal ?? payload.totalCost, 0),
      numberValue(payload.profitTotal ?? payload.estimatedProfit, 0),
      grandTotal,
    );

    const row = await getOrderById(payload.id);
    res.status(201).json(rowToOrder(row));
  }),
);

app.patch(
  "/orders/:id",
  withErrorHandling(async (req, res) => {
    const current = await db.get("SELECT * FROM orders WHERE id = ?", req.params.id);
    if (!current) return notFound(res, "Order not found");

    if (req.body.customerId !== undefined) {
      const customer = await db.get("SELECT id FROM customers WHERE id = ?", req.body.customerId);
      if (!customer) return badRequest(res, "Invalid customerId");
    }

    const nextGrandTotal =
      req.body.grandTotal !== undefined
        ? numberValue(req.body.grandTotal, current.grand_total)
        : req.body.totalAmount !== undefined
          ? numberValue(req.body.totalAmount, current.grand_total)
          : numberValue(current.grand_total, 0);

    const nextDiscountTotal =
      req.body.discountTotal !== undefined
        ? numberValue(req.body.discountTotal, current.discount_total)
        : req.body.totalDiscount !== undefined
          ? numberValue(req.body.totalDiscount, current.discount_total)
          : numberValue(current.discount_total, 0);

    await db.run(
      `UPDATE orders
       SET order_number = ?, customer_id = ?, order_date = ?, status = ?, currency = ?,
           subtotal = ?, discount_total = ?, cost_total = ?, profit_total = ?, grand_total = ?
       WHERE id = ?`,
      req.body.orderNumber ?? current.order_number,
      req.body.customerId ?? current.customer_id,
      req.body.orderDate ?? current.order_date,
      req.body.status ?? current.status,
      req.body.currency ?? current.currency,
      req.body.subtotal !== undefined ? numberValue(req.body.subtotal, current.subtotal) : numberValue(current.subtotal, nextGrandTotal + nextDiscountTotal),
      nextDiscountTotal,
      req.body.costTotal !== undefined ? numberValue(req.body.costTotal, current.cost_total) : req.body.totalCost !== undefined ? numberValue(req.body.totalCost, current.cost_total) : numberValue(current.cost_total, 0),
      req.body.profitTotal !== undefined
        ? numberValue(req.body.profitTotal, current.profit_total)
        : req.body.estimatedProfit !== undefined
          ? numberValue(req.body.estimatedProfit, current.profit_total)
          : numberValue(current.profit_total, 0),
      nextGrandTotal,
      req.params.id,
    );

    const row = await getOrderById(req.params.id);
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
      where.push("op.order_id = ?");
      params.push(req.query.orderId);
    }

    const whereClause = where.length ? ` WHERE ${where.join(" AND ")}` : "";
    const orderClause = buildOrderClause(
      req.query,
      {
        id: "op.id",
        quantity: "op.quantity",
        lineTotal: "op.line_total",
        lineProfit: "op.profit_amount",
      },
      "id",
      "ASC",
    );

    const rows = await db.all(
      `SELECT op.id, op.order_id, op.product_id, op.quantity, op.unit_price, op.line_subtotal,
              op.discount_percent, op.discount_amount, op.line_total, op.unit_cost_at_sale, op.profit_amount,
              p.sku AS product_sku, p.name AS product_name, p.unit AS product_unit
       FROM order_product op
       LEFT JOIN products p ON p.id = op.product_id${whereClause}${orderClause}`,
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

    const order = await db.get("SELECT id FROM orders WHERE id = ?", payload.orderId);
    if (!order) return badRequest(res, "Invalid orderId");

    const product = await db.get(
      `SELECT p.id, p.base_price, sp.purchase_price
       FROM products p
       ${PRIMARY_SUPPLIER_JOIN_SQL}
       WHERE p.id = ?`,
      payload.productId,
    );
    if (!product) return badRequest(res, "Invalid productId");

    const quantity = numberValue(payload.quantity, 0);
    const unitPrice = numberValue(payload.sellingPriceSnapshot ?? payload.unitPrice, 0);
    const lineSubtotal = payload.lineSubtotal !== undefined ? numberValue(payload.lineSubtotal, 0) : quantity * unitPrice;
    const discountAmount = numberValue(payload.discountAmount, 0);
    const discountPercent =
      (payload.discountType ?? "percentage") === "percentage"
        ? numberValue(payload.discountValue, 0)
        : lineSubtotal > 0
          ? (discountAmount / lineSubtotal) * 100
          : 0;

    await db.run(
      `INSERT INTO order_product (
        id, product_id, order_id, quantity, unit_price, line_subtotal,
        discount_percent, discount_amount, line_total, unit_cost_at_sale, profit_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      payload.id,
      payload.productId,
      payload.orderId,
      quantity,
      unitPrice,
      lineSubtotal,
      discountPercent,
      discountAmount,
      numberValue(payload.lineTotal, 0),
      numberValue(payload.fixedCostSnapshot ?? payload.unitCostAtSale ?? product.purchase_price ?? product.base_price, 0),
      numberValue(payload.lineProfit ?? payload.profitAmount, 0),
    );

    const row = await getOrderItemById(payload.id);
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
      where.push("cp.customer_id = ?");
      params.push(req.query.customerId);
    }

    const whereClause = where.length ? ` WHERE ${where.join(" AND ")}` : "";
    const rows = await db.all(
      `SELECT cp.customer_id, cp.product_id, cp.discount_percent, cp.start_date, cp.end_date, cp.is_active,
              p.name AS product_name
       FROM customer_product cp
       LEFT JOIN products p ON p.id = cp.product_id${whereClause}`,
      ...params,
    );

    let mapped = rows.map(rowToDiscount);
    if (typeof req.query.status === "string" && req.query.status) {
      mapped = mapped.filter((item) => item.status === req.query.status);
    }

    const sortableColumns = new Set(["startDate", "endDate", "status", "name"]);
    const sortKey = typeof req.query._sort === "string" && sortableColumns.has(req.query._sort) ? req.query._sort : "startDate";
    const sortDir = typeof req.query._order === "string" ? req.query._order : "desc";
    mapped = sortArrayBy(mapped, sortKey, sortDir);

    res.json(mapped);
  }),
);

app.post(
  "/discounts",
  withErrorHandling(async (req, res) => {
    const payload = req.body ?? {};
    if (!payload.customerId || !payload.scopeType || !payload.scopeId) {
      return badRequest(res, "customerId, scopeType and scopeId are required");
    }

    const customer = await db.get("SELECT id FROM customers WHERE id = ?", payload.customerId);
    if (!customer) return badRequest(res, "Invalid customerId");

    let productRows = [];
    if (payload.scopeType === "product") {
      const product = await db.get("SELECT id, base_price, name FROM products WHERE id = ?", payload.scopeId);
      if (!product) return badRequest(res, "Invalid scopeId for product");
      productRows = [product];
    } else if (payload.scopeType === "category") {
      productRows = await db.all("SELECT id, base_price, name FROM products WHERE category_id = ?", payload.scopeId);
      if (productRows.length === 0) return badRequest(res, "No products found for category scopeId");
    } else {
      return badRequest(res, "scopeType must be 'product' or 'category'");
    }

    const isActive = payload.status === "expired" ? 0 : 1;
    for (const product of productRows) {
      const discountPercent = resolveDiscountPercent(payload.discountType, payload.value, numberValue(product.base_price, 0));
      await db.run(
        `INSERT INTO customer_product (customer_id, product_id, discount_percent, start_date, end_date, is_active)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(customer_id, product_id)
         DO UPDATE SET discount_percent = excluded.discount_percent, start_date = excluded.start_date, end_date = excluded.end_date, is_active = excluded.is_active`,
        payload.customerId,
        product.id,
        discountPercent,
        payload.startDate ?? null,
        payload.endDate ?? null,
        isActive,
      );
    }

    const firstProductId = productRows[0].id;
    const row = await getDiscountByKeys(payload.customerId, firstProductId);
    res.status(201).json(rowToDiscount(row));
  }),
);

app.patch(
  "/discounts/:id",
  withErrorHandling(async (req, res) => {
    const currentKeys = parseDiscountId(req.params.id);
    if (!currentKeys) return badRequest(res, "Invalid discount id");

    const current = await getDiscountByKeys(currentKeys.customerId, currentKeys.productId);
    if (!current) return notFound(res, "Discount not found");

    const targetCustomerId = req.body.customerId ?? current.customer_id;
    const scopeType = req.body.scopeType ?? "product";
    const scopeId = req.body.scopeId ?? current.product_id;

    let productRows = [];
    if (scopeType === "product") {
      const product = await db.get("SELECT id, base_price FROM products WHERE id = ?", scopeId);
      if (!product) return badRequest(res, "Invalid scopeId for product");
      productRows = [product];
    } else if (scopeType === "category") {
      productRows = await db.all("SELECT id, base_price FROM products WHERE category_id = ?", scopeId);
      if (productRows.length === 0) return badRequest(res, "No products found for category scopeId");
    } else {
      return badRequest(res, "scopeType must be 'product' or 'category'");
    }

    const customer = await db.get("SELECT id FROM customers WHERE id = ?", targetCustomerId);
    if (!customer) return badRequest(res, "Invalid customerId");

    const nextStartDate = req.body.startDate ?? current.start_date ?? null;
    const nextEndDate = req.body.endDate ?? current.end_date ?? null;
    const nextIsActive = req.body.status ? (req.body.status === "expired" ? 0 : 1) : current.is_active;

    for (const product of productRows) {
      const discountPercent =
        req.body.value !== undefined
          ? resolveDiscountPercent(req.body.discountType ?? "percentage", req.body.value, numberValue(product.base_price, 0))
          : numberValue(current.discount_percent, 0);

      await db.run(
        `INSERT INTO customer_product (customer_id, product_id, discount_percent, start_date, end_date, is_active)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(customer_id, product_id)
         DO UPDATE SET discount_percent = excluded.discount_percent, start_date = excluded.start_date, end_date = excluded.end_date, is_active = excluded.is_active`,
        targetCustomerId,
        product.id,
        discountPercent,
        nextStartDate,
        nextEndDate,
        nextIsActive,
      );
    }

    const targetKeys = new Set(productRows.map((product) => `${targetCustomerId}__${product.id}`));
    if (!targetKeys.has(req.params.id)) {
      await db.run(
        "DELETE FROM customer_product WHERE customer_id = ? AND product_id = ?",
        currentKeys.customerId,
        currentKeys.productId,
      );
    }

    const firstRow = await getDiscountByKeys(targetCustomerId, productRows[0].id);
    res.json(rowToDiscount(firstRow));
  }),
);

app.get(
  "/users",
  withErrorHandling(async (req, res) => {
    const orderClause = buildOrderClause(
      req.query,
      {
        createdAt: "id",
        username: "username",
        role: "role",
      },
      "createdAt",
      "DESC",
    );

    const rows = await db.all(
      `SELECT id, username, password, first_name, last_name, email, role, status
       FROM users${orderClause}`,
    );

    res.json(rows.map(rowToUser));
  }),
);

app.post(
  "/auth/login",
  withErrorHandling(async (req, res) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) return badRequest(res, "username and password are required");

    const row = await db.get(
      `SELECT id, username, password, first_name, last_name, email, role, status
       FROM users
       WHERE LOWER(username) = LOWER(?)
       LIMIT 1`,
      username,
    );

    if (!row) return res.status(401).send("Invalid username or password");
    if (row.status && row.status !== "active") return res.status(403).send("User is not active");
    if (row.password !== password) return res.status(401).send("Invalid username or password");

    res.json(toSafeUser(row));
  }),
);

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
      where.push("i.product_id = ?");
      params.push(req.query.productId);
    }

    if (typeof req.query.warehouseId === "string" && req.query.warehouseId) {
      where.push("i.warehouse_id = ?");
      params.push(req.query.warehouseId);
    }

    const whereClause = where.length ? ` WHERE ${where.join(" AND ")}` : "";

    const rows = await db.all(
      `SELECT i.id, i.warehouse_id, i.product_id, i.stock_quantity, i.reorder_level,
              sp.supplier_id, sp.purchase_price AS supplier_price, sp.supplier_discount_percent AS supplier_discount
       FROM inventory i
       LEFT JOIN supplier_product sp
         ON sp.product_id = i.product_id
        AND sp.id = (
          SELECT sp2.id
          FROM supplier_product sp2
          WHERE sp2.product_id = i.product_id
          ORDER BY COALESCE(sp2.is_primary_supplier, 0) DESC, sp2.id ASC
          LIMIT 1
        )${whereClause}
       ORDER BY i.id ASC`,
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
