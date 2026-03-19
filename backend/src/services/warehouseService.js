import { mapWarehouse } from "../mappers/warehouseMapper.js";

export function createWarehouseService({ warehouseRepository }) {
  return {
    async listWarehouses() {
      const rows = await warehouseRepository.listWarehouses();
      return rows.map(mapWarehouse);
    },
  };
}
