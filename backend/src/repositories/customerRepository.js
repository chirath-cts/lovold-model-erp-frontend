import { buildOrderClause } from "../lib/sortUtils.js";

export function createCustomerRepository(db) {
  return {
    listCustomers(query) {
      const orderClause = buildOrderClause(
        query,
        {
          name: "name",
          customerCode: "customer_code",
          status: "status",
        },
        "name",
        "ASC",
      );

      return db.all(
        `SELECT id, customer_code, name, email, phone, address, status
         FROM customers${orderClause}`,
      );
    },
    getCustomerById(id) {
      return db.get(
        `SELECT id, customer_code, name, email, phone, address, status
         FROM customers
         WHERE id = ?`,
        id,
      );
    },
    existsById(id) {
      return db.get("SELECT id FROM customers WHERE id = ?", id);
    },
  };
}
