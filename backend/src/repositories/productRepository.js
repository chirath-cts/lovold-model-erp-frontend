import { buildOrderClause } from "../lib/sortUtils.js";
import { PRIMARY_SUPPLIER_JOIN_SQL } from "../lib/sqlFragments.js";

export function createProductRepository(db) {
  return {
    listProducts({ categoryId, search, sortQuery }) {
      const where = [];
      const params = [];

      if (categoryId) {
        where.push("p.category_id = ?");
        params.push(categoryId);
      }

      if (search) {
        where.push("(LOWER(p.name) LIKE ? OR LOWER(COALESCE(p.sku, '')) LIKE ?)");
        const like = `%${search.toLowerCase()}%`;
        params.push(like, like);
      }

      const whereClause = where.length ? ` WHERE ${where.join(" AND ")}` : "";
      const orderClause = buildOrderClause(
        sortQuery,
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

      return db.all(
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
    },
    getProductById(id) {
      return db.get(
        `SELECT p.id, p.name, p.sku, p.category_id, p.description, p.image_url, p.base_price, p.unit, p.status, sp.purchase_price,
                COALESCE(SUM(i.stock_quantity), 0) AS stock_quantity,
                COALESCE(SUM(i.reorder_level), 0) AS reorder_level
         FROM products p
         LEFT JOIN inventory i ON i.product_id = p.id
         ${PRIMARY_SUPPLIER_JOIN_SQL}
         WHERE p.id = ?
         GROUP BY p.id, p.name, p.sku, p.category_id, p.description, p.image_url, p.base_price, p.unit, p.status, sp.purchase_price`,
        id,
      );
    },
    getProductRecordById(id) {
      return db.get("SELECT * FROM products WHERE id = ?", id);
    },
    getProductPricingById(id) {
      return db.get(
        `SELECT p.id, p.base_price, sp.purchase_price
         FROM products p
         ${PRIMARY_SUPPLIER_JOIN_SQL}
         WHERE p.id = ?`,
        id,
      );
    },
    getProductScopeById(id) {
      return db.get("SELECT id, base_price, name FROM products WHERE id = ?", id);
    },
    listProductScopeByCategory(categoryId) {
      return db.all(
        "SELECT id, base_price, name FROM products WHERE category_id = ?",
        categoryId,
      );
    },
    createProduct({
      id,
      categoryId,
      name,
      sku,
      description,
      imageUrl,
      basePrice,
      unit,
      status,
    }) {
      return db.run(
        `INSERT INTO products (id, category_id, name, sku, description, image_url, base_price, unit, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        categoryId,
        name,
        sku,
        description,
        imageUrl,
        basePrice,
        unit,
        status,
      );
    },
    updateProductRecord(id, next) {
      return db.run(
        `UPDATE products
         SET category_id = ?, name = ?, sku = ?, description = ?, image_url = ?, base_price = ?, unit = ?, status = ?
         WHERE id = ?`,
        next.category_id,
        next.name,
        next.sku,
        next.description,
        next.image_url,
        next.base_price,
        next.unit,
        next.status,
        id,
      );
    },
    getInventoryRowByProductId(productId) {
      return db.get(
        "SELECT id FROM inventory WHERE product_id = ? ORDER BY id ASC LIMIT 1",
        productId,
      );
    },
    createInventoryRow({ id, warehouseId, productId, stockQuantity, reorderLevel, updatedAt }) {
      return db.run(
        `INSERT OR IGNORE INTO inventory (
          id, warehouse_id, product_id, stock_quantity, reorder_level, reserved_quantity, last_stock_update_at
        ) VALUES (?, ?, ?, ?, ?, 0, ?)`,
        id,
        warehouseId,
        productId,
        stockQuantity,
        reorderLevel,
        updatedAt,
      );
    },
    resetInventoryStock(productId) {
      return db.run("UPDATE inventory SET stock_quantity = 0 WHERE product_id = ?", productId);
    },
    updateInventoryStock(inventoryRowId, stockQuantity, updatedAt) {
      return db.run(
        "UPDATE inventory SET stock_quantity = ?, last_stock_update_at = ? WHERE id = ?",
        stockQuantity,
        updatedAt,
        inventoryRowId,
      );
    },
    resetInventoryReorderLevel(productId) {
      return db.run("UPDATE inventory SET reorder_level = 0 WHERE product_id = ?", productId);
    },
    updateInventoryReorderLevel(inventoryRowId, reorderLevel, updatedAt) {
      return db.run(
        "UPDATE inventory SET reorder_level = ?, last_stock_update_at = ? WHERE id = ?",
        reorderLevel,
        updatedAt,
        inventoryRowId,
      );
    },
  };
}
