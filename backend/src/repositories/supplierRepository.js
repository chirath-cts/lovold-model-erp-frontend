export function createSupplierRepository(db) {
  return {
    listSuppliers() {
      return db.all(
        "SELECT id, name, email, phone, address, status FROM suppliers ORDER BY name ASC",
      );
    },
    getDefaultSupplierId() {
      return db.get("SELECT id FROM suppliers ORDER BY id ASC LIMIT 1");
    },
  };
}
