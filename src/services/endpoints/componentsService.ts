import { mockDb, type ComponentFilters } from "@/services/mock/mockDb";
import type {
  CreateComponentPayload,
  UpdateComponentPayload,
} from "@/shared/types/domain";

export type { ComponentFilters };

export const componentsService = {
  getList(filters?: ComponentFilters) {
    return mockDb.listComponents(filters);
  },
  getById(id: string) {
    return mockDb.getComponentById(id);
  },
  create(payload: CreateComponentPayload) {
    return mockDb.addComponent(payload);
  },
  update(id: string, payload: UpdateComponentPayload) {
    return mockDb.updateComponent(id, payload);
  },
  updateStock(id: string, stockQuantity: number) {
    return mockDb.updateComponentStock(id, stockQuantity);
  },
};
