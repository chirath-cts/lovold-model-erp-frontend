import { mockDb, type OrderFilters } from "@/services/mock/mockDb";
import type { CreateOrderPayload, UpdateOrderPayload } from "@/shared/types/domain";

export type { OrderFilters };

export const ordersService = {
  getList(filters?: OrderFilters) {
    return mockDb.listOrders(filters);
  },
  getById(id: string) {
    return mockDb.getOrderById(id);
  },
  create(payload: CreateOrderPayload) {
    return mockDb.addOrder(payload);
  },
  update(id: string, payload: UpdateOrderPayload) {
    return mockDb.updateOrder(id, payload);
  },
  remove(id: string) {
    return mockDb.removeOrder(id);
  },
};
