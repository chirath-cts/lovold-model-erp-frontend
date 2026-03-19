import { buildOrderClause } from "../lib/sortUtils.js";

export function createOrderRepository(db) {
  return {
    listOrders({ customerId, status, sortQuery }) {
      const where = [];
      const params = [];

      if (customerId) {
        where.push("o.customer_id = ?");
        params.push(customerId);
      }

      if (status) {
        where.push("o.status = ?");
        params.push(status);
      }

      const whereClause = where.length ? ` WHERE ${where.join(" AND ")}` : "";
      const orderClause = buildOrderClause(
        sortQuery,
        {
          orderDate: "o.order_date",
          grandTotal: "o.grand_total",
          status: "o.status",
          orderNumber: "o.order_number",
        },
        "orderDate",
        "DESC",
      );

      return db.all(
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
    },
    getOrderById(id) {
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
        id,
      );
    },
    getOrderRecordById(id) {
      return db.get("SELECT * FROM orders WHERE id = ?", id);
    },
    createOrder(payload) {
      return db.run(
        `INSERT INTO orders (
          id, order_number, customer_id, order_date, status, currency,
          subtotal, discount_total, cost_total, profit_total, grand_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        payload.id,
        payload.orderNumber,
        payload.customerId,
        payload.orderDate,
        payload.status,
        payload.currency,
        payload.subtotal,
        payload.discountTotal,
        payload.costTotal,
        payload.profitTotal,
        payload.grandTotal,
      );
    },
    updateOrder(id, payload) {
      return db.run(
        `UPDATE orders
         SET order_number = ?, customer_id = ?, order_date = ?, status = ?, currency = ?,
             subtotal = ?, discount_total = ?, cost_total = ?, profit_total = ?, grand_total = ?
         WHERE id = ?`,
        payload.orderNumber,
        payload.customerId,
        payload.orderDate,
        payload.status,
        payload.currency,
        payload.subtotal,
        payload.discountTotal,
        payload.costTotal,
        payload.profitTotal,
        payload.grandTotal,
        id,
      );
    },
    deleteOrder(id) {
      return db.run("DELETE FROM orders WHERE id = ?", id);
    },
  };
}
