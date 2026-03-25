import { mockDb } from "@/services/mock/mockDb";
import type { OrderProductionStep } from "@/shared/types/domain";

export const orderProductionStepsService = {
  getList(orderId?: string) {
    return mockDb.listOrderProductionSteps(orderId);
  },
  create(payload: Omit<OrderProductionStep, "id"> & { id?: string }) {
    return mockDb.addOrderProductionStep(payload);
  },
  update(id: string, payload: Partial<OrderProductionStep>) {
    return mockDb.updateOrderProductionStep(id, payload);
  },
  remove(id: string) {
    return mockDb.removeOrderProductionStep(id);
  },
};
