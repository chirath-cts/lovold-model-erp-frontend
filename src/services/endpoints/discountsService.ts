import { apiClient } from "@/services/http/apiClient";
import type { Discount } from "@/shared/types/domain";

const RESOURCE = "discounts";

export interface DiscountFilters {
  customerId?: string;
  status?: string;
}

export const discountsService = {
  getList(filters?: DiscountFilters) {
    return apiClient.getList<Discount>(RESOURCE, {
      customerId: filters?.customerId,
      status: filters?.status,
    });
  },
  create(payload: Discount) {
    return apiClient.create<Discount, Discount>(RESOURCE, payload);
  },
  update(id: string, payload: Partial<Discount>) {
    return apiClient.update<Discount, Partial<Discount>>(RESOURCE, id, payload);
  },
};
