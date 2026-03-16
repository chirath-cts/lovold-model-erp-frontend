import { apiClient } from "@/services/http/apiClient";
import type { Product } from "@/shared/types/domain";

const RESOURCE = "products";

export interface ProductFilters {
  nameLike?: string;
  categoryId?: string;
}

export interface CreateProductPayload {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  unitPrice: number;
  fixedCostPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  unit: string;
  status: Product["status"];
  description?: string;
  currency?: Product["currency"];
}

export interface UpdateProductPayload {
  name: string;
  sku: string;
  categoryId: string;
  unitPrice: number;
  fixedCostPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  unit: string;
  status: Product["status"];
  description?: string;
}

export const productsService = {
  getList(filters?: ProductFilters) {
    return apiClient.getList<Product>(RESOURCE, {
      q: filters?.nameLike,
      categoryId: filters?.categoryId,
    });
  },
  create(payload: CreateProductPayload) {
    return apiClient.create<Product, CreateProductPayload>(RESOURCE, payload);
  },
  update(id: string, payload: UpdateProductPayload) {
    return apiClient.update<Product, UpdateProductPayload>(RESOURCE, id, payload);
  },
  updateStock(id: string, stockQuantity: number) {
    return apiClient.update<Product, Pick<Product, "stockQuantity">>(RESOURCE, id, {
      stockQuantity,
    });
  },
};
