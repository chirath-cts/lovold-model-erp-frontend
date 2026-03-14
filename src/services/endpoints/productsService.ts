import { apiClient } from "@/services/http/apiClient";
import type { Product } from "@/shared/types/domain";

const RESOURCE = "products";

export interface ProductFilters {
  nameLike?: string;
  categoryId?: string;
}

export const productsService = {
  getList(filters?: ProductFilters) {
    return apiClient.getList<Product>(RESOURCE, {
      q: filters?.nameLike,
      categoryId: filters?.categoryId,
    });
  },
  updateStock(id: string, stockQuantity: number) {
    return apiClient.update<Product, Pick<Product, "stockQuantity">>(RESOURCE, id, {
      stockQuantity,
    });
  },
};
