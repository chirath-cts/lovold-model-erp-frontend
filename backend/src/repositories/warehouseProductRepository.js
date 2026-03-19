export function createWarehouseProductRepository(db) {
  return {
    listWarehouseProducts({ productId, warehouseId }) {
      const where = [];
      const params = [];

      if (productId) {
        where.push("i.product_id = ?");
        params.push(productId);
      }

      if (warehouseId) {
        where.push("i.warehouse_id = ?");
        params.push(warehouseId);
      }

      const whereClause = where.length ? ` WHERE ${where.join(" AND ")}` : "";

      return db.all(
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
    },
  };
}
