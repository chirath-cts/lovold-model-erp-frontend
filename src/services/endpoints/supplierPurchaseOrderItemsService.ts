import { mockDb } from "@/services/mock/mockDb";

export const supplierPurchaseOrderItemsService = {
  getList(purchaseOrderId?: string) {
    return mockDb.listSupplierPurchaseOrderItems(purchaseOrderId);
  },
};
