import { apiClient } from "@/services/http/apiClient";
import type { Customer } from "@/shared/types/domain";

const RESOURCE = "customers";

export const customersService = {
  getList() {
    return apiClient.getList<Customer>(RESOURCE, {
      _sort: "companyName",
      _order: "asc",
    });
  },
  getById(id: string) {
    return apiClient.getById<Customer>(RESOURCE, id);
  },
};
