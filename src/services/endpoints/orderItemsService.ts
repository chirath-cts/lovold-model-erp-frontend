import { mockDb } from "@/services/mock/mockDb";
import type { CreateOrderItemPayload } from "@/shared/types/domain";

export const orderItemsService = {
  getList(orderId?: string) {
    return mockDb.listOrderItems(orderId);
  },
  create(payload: CreateOrderItemPayload) {
    return mockDb.addOrderItem(payload);
  },
  remove(id: string) {
    return mockDb.removeOrderItem(id);
  },
};
