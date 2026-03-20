export function createWarehouseRepository(db) {
  return {
    listWarehouses() {
      return db.all("SELECT id, name, location FROM warehouses ORDER BY name ASC");
    },
    getPrimaryWarehouseId() {
      return db.get("SELECT id FROM warehouses ORDER BY id ASC LIMIT 1");
    },
  };
}
