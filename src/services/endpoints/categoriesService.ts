import { mockDb } from "@/services/mock/mockDb";
import type { Category } from "@/shared/types/domain";

export const categoriesService = {
  getList() {
    return mockDb.listCategories();
  },
  create(payload: Category) {
    return mockDb.addCategory(payload);
  },
};
