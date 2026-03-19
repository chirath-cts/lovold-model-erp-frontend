import { mapSupplier } from "../mappers/supplierMapper.js";

export function createSupplierService({ supplierRepository }) {
  return {
    async listSuppliers() {
      const rows = await supplierRepository.listSuppliers();
      return rows.map(mapSupplier);
    },
  };
}
