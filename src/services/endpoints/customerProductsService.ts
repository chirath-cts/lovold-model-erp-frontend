import type {
  CreateCustomerProductPayload,
  CustomerProduct,
  UpdateCustomerProductPayload,
} from "@/shared/types/domain";
import { mockDb } from "@/services/mock/mockDb";

export interface CustomerProductFilters {
  customerId?: string;
  status?: string;
}

export const customerProductsService = {
  getList(filters?: CustomerProductFilters) {
    return mockDb.listCustomerProducts(filters);
  },
  create(payload: CreateCustomerProductPayload) {
    return mockDb.addCustomerProduct({
      ...payload,
      status: "active",
    } satisfies CustomerProduct);
  },
  update(id: string, payload: UpdateCustomerProductPayload) {
    return mockDb.updateCustomerProduct(id, payload as Partial<CustomerProduct>);
  },
};
