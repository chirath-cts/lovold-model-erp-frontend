import { mapWarehouseProduct } from "../mappers/warehouseMapper.js";

export function createWarehouseProductService({ warehouseProductRepository }) {
  return {
    async listWarehouseProducts(filters) {
      const rows = await warehouseProductRepository.listWarehouseProducts(filters);
      return rows.map(mapWarehouseProduct);
    },
  };
}
