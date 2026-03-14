import { apiClient } from "@/services/http/apiClient";
import type { Order, OrderStatus } from "@/shared/types/domain";

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
  create(payload: Order) {
    return apiClient.create<Order, Order>(RESOURCE, payload);
  },
  update(id: string, payload: Partial<Order>) {
    return apiClient.update<Order, Partial<Order>>(RESOURCE, id, payload);
  },
  remove(id: string) {
    return apiClient.remove(RESOURCE, id);
  },
};
