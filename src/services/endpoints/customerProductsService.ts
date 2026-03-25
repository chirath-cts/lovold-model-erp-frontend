import type {
  CreateCustomerProductPayload,
  UpdateCustomerProductPayload,
} from "@/shared/types/domain";
import { mockDb, type CustomerProductFilters } from "@/services/mock/mockDb";

export type { CustomerProductFilters };

export const customerProductsService = {
  getList(filters?: CustomerProductFilters) {
    return mockDb.listCustomerProducts(filters);
  },
  create(payload: CreateCustomerProductPayload) {
    return mockDb.addCustomerProduct(payload);
  },
  update(id: string, payload: UpdateCustomerProductPayload) {
    return mockDb.updateCustomerProduct(id, payload);
  },
};
