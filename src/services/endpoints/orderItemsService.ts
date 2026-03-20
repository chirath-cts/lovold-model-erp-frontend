import { apiClient } from "@/services/http/apiClient";
import type { CreateOrderItemPayload, OrderItem } from "@/shared/types/domain";

const RESOURCE = "orderItems";

export const orderItemsService = {
  getList(orderId?: string) {
    return apiClient.getList<OrderItem>(RESOURCE, {
      orderId,
      _sort: "id",
      _order: "asc",
    });
  },
  create(payload: CreateOrderItemPayload) {
    return apiClient.create<OrderItem, CreateOrderItemPayload>(RESOURCE, payload);
  },
  remove(id: string) {
    return apiClient.remove(RESOURCE, id);
  },
};
