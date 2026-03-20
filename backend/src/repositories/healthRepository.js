export function createHealthRepository(db) {
  return {
    countCustomers() {
      return db.get("SELECT COUNT(*) AS customers FROM customers");
    },
  };
}
