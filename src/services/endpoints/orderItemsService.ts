import { apiClient } from "@/services/http/apiClient";
import type { OrderItem } from "@/shared/types/domain";

const RESOURCE = "orderItems";

export const orderItemsService = {
  getList(orderId?: string) {
    return apiClient.getList<OrderItem>(RESOURCE, {
      orderId,
      _sort: "id",
      _order: "asc",
    });
  },
  create(payload: OrderItem) {
    return apiClient.create<OrderItem, OrderItem>(RESOURCE, payload);
  },
  remove(id: string) {
    return apiClient.remove(RESOURCE, id);
  },
};
