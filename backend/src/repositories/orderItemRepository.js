import { buildOrderClause } from "../lib/sortUtils.js";

export function createOrderItemRepository(db) {
  return {
    listOrderItems({ orderId, sortQuery }) {
      const where = [];
      const params = [];

      if (orderId) {
        where.push("op.order_id = ?");
        params.push(orderId);
      }

      const whereClause = where.length ? ` WHERE ${where.join(" AND ")}` : "";
      const orderClause = buildOrderClause(
        sortQuery,
        {
          id: "op.id",
          quantity: "op.quantity",
          lineTotal: "op.line_total",
          profitAmount: "op.profit_amount",
        },
        "id",
        "ASC",
      );

      return db.all(
        `SELECT op.id, op.order_id, op.product_id, op.quantity, op.unit_price, op.line_subtotal,
                op.discount_percent, op.discount_amount, op.line_total, op.unit_cost_at_sale, op.profit_amount,
                p.sku AS product_sku, p.name AS product_name, p.unit AS product_unit
         FROM order_product op
         LEFT JOIN products p ON p.id = op.product_id${whereClause}${orderClause}`,
        ...params,
      );
    },
    getOrderItemById(id) {
      return db.get(
        `SELECT op.id, op.order_id, op.product_id, op.quantity, op.unit_price, op.line_subtotal,
                op.discount_percent, op.discount_amount, op.line_total, op.unit_cost_at_sale, op.profit_amount,
                p.sku AS product_sku, p.name AS product_name, p.unit AS product_unit
         FROM order_product op
         LEFT JOIN products p ON p.id = op.product_id
         WHERE op.id = ?`,
        id,
      );
    },
    createOrderItem(payload) {
      return db.run(
        `INSERT INTO order_product (
          id, product_id, order_id, quantity, unit_price, line_subtotal,
          discount_percent, discount_amount, line_total, unit_cost_at_sale, profit_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        payload.id,
        payload.productId,
        payload.orderId,
        payload.quantity,
        payload.unitPrice,
        payload.lineSubtotal,
        payload.discountPercent,
        payload.discountAmount,
        payload.lineTotal,
        payload.unitCostAtSale,
        payload.profitAmount,
      );
    },
    deleteOrderItem(id) {
      return db.run("DELETE FROM order_product WHERE id = ?", id);
    },
  };
}
