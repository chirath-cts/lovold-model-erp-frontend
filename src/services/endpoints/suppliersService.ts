import { mockDb } from "@/services/mock/mockDb";

export const suppliersService = {
  getList() {
    return mockDb.listSuppliers();
  },
  getById(id: string) {
    return mockDb.getSupplierById(id);
  },
};
