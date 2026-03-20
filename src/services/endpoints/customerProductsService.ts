import { apiClient } from "@/services/http/apiClient";
import type {
  CreateCustomerProductPayload,
  CustomerProduct,
  UpdateCustomerProductPayload,
} from "@/shared/types/domain";

const RESOURCE = "customer-products";

export interface CustomerProductFilters {
  customerId?: string;
  status?: string;
}

export const customerProductsService = {
  getList(filters?: CustomerProductFilters) {
    return apiClient.getList<CustomerProduct>(RESOURCE, {
      customerId: filters?.customerId,
      status: filters?.status,
    });
  },
  create(payload: CreateCustomerProductPayload) {
    return apiClient.create<CustomerProduct, CreateCustomerProductPayload>(
      RESOURCE,
      payload,
    );
  },
  update(id: string, payload: UpdateCustomerProductPayload) {
    return apiClient.update<CustomerProduct, UpdateCustomerProductPayload>(
      RESOURCE,
      id,
      payload,
    );
  },
};
