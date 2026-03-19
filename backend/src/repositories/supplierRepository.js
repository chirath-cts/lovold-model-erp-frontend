export function createSupplierRepository(db) {
  return {
    listSuppliers() {
      return db.all(
        "SELECT id, name, email, phone, address, status FROM suppliers ORDER BY name ASC",
      );
    },
  };
}
