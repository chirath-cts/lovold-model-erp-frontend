export function createCustomerProductRepository(db) {
  return {
    listCustomerProductRows(customerId) {
      const where = [];
      const params = [];

      if (customerId) {
        where.push("cp.customer_id = ?");
        params.push(customerId);
      }

      const whereClause = where.length ? ` WHERE ${where.join(" AND ")}` : "";

      return db.all(
        `SELECT cp.customer_id, cp.product_id, cp.discount_percent, cp.start_date, cp.end_date, cp.is_active
         FROM customer_product cp${whereClause}`,
        ...params,
      );
    },
    listDiscountRows(customerId) {
      return this.listCustomerProductRows(customerId);
    },
    getCustomerProductByKeys(customerId, productId) {
      return db.get(
        `SELECT cp.customer_id, cp.product_id, cp.discount_percent, cp.start_date, cp.end_date, cp.is_active
         FROM customer_product cp
         WHERE cp.customer_id = ? AND cp.product_id = ?`,
        customerId,
        productId,
      );
    },
    getDiscountByKeys(customerId, productId) {
      return this.getCustomerProductByKeys(customerId, productId);
    },
    upsertCustomerProduct({ customerId, productId, discountPercent, startDate, endDate, isActive }) {
      return db.run(
        `INSERT INTO customer_product (customer_id, product_id, discount_percent, start_date, end_date, is_active)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(customer_id, product_id)
         DO UPDATE SET discount_percent = excluded.discount_percent, start_date = excluded.start_date, end_date = excluded.end_date, is_active = excluded.is_active`,
        customerId,
        productId,
        discountPercent,
        startDate,
        endDate,
        isActive,
      );
    },
    deleteCustomerProduct(customerId, productId) {
      return db.run(
        "DELETE FROM customer_product WHERE customer_id = ? AND product_id = ?",
        customerId,
        productId,
      );
    },
  };
}
