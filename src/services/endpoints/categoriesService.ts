import { apiClient } from "@/services/http/apiClient";
import type { Category } from "@/shared/types/domain";

const RESOURCE = "categories";

export const categoriesService = {
  getList() {
    return apiClient.getList<Category>(RESOURCE);
  },
  create(payload: Category) {
    return apiClient.create<Category, Category>(RESOURCE, payload);
  },
};
