import { mockDb, type SupplierPurchaseOrderFilters } from "@/services/mock/mockDb";

export type { SupplierPurchaseOrderFilters };

export const supplierPurchaseOrdersService = {
  getList(filters?: SupplierPurchaseOrderFilters) {
    return mockDb.listSupplierPurchaseOrders(filters);
  },
  getById(id: string) {
    return mockDb.getSupplierPurchaseOrderById(id);
  },
};
