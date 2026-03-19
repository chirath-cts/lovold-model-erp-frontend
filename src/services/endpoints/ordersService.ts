import { apiClient } from "@/services/http/apiClient";
import type {
  CreateOrderPayload,
  Order,
  OrderStatus,
  UpdateOrderPayload,
} from "@/shared/types/domain";

const RESOURCE = "orders";

export interface OrderFilters {
  status?: OrderStatus | "";
  customerId?: string;
}

export const ordersService = {
  getList(filters?: OrderFilters) {
    return apiClient.getList<Order>(RESOURCE, {
      status: filters?.status,
      customerId: filters?.customerId,
      _sort: "orderDate",
      _order: "desc",
    });
  },
  create(payload: CreateOrderPayload) {
    return apiClient.create<Order, CreateOrderPayload>(RESOURCE, payload);
  },
  update(id: string, payload: UpdateOrderPayload) {
    return apiClient.update<Order, UpdateOrderPayload>(RESOURCE, id, payload);
  },
  remove(id: string) {
    return apiClient.remove(RESOURCE, id);
  },
};
