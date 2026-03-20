import { mockDb } from "@/services/mock/mockDb";
import type { Product } from "@/shared/types/domain";

export interface ProductFilters {
  nameLike?: string;
  categoryId?: string;
}

export interface CreateProductPayload {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  imageUrl?: string | null;
  basePrice: number;
  purchasePrice: number;
  stockQuantity: number;
  reorderLevel: number;
  unit: string;
  status: Product["status"];
  description?: string;
}

export interface UpdateProductPayload {
  name: string;
  sku: string;
  categoryId: string;
  imageUrl?: string | null;
  basePrice: number;
  purchasePrice: number;
  stockQuantity: number;
  reorderLevel: number;
  unit: string;
  status: Product["status"];
  description?: string;
}

export const productsService = {
  getList(filters?: ProductFilters) {
    return mockDb.listProducts(filters);
  },
  create(payload: CreateProductPayload) {
    const product: Product = {
      ...payload,
      description: payload.description ?? "",
    };

    return mockDb.addProduct(product);
  },
  update(id: string, payload: UpdateProductPayload) {
    return mockDb.updateProduct(id, payload);
  },
  updateStock(id: string, stockQuantity: number) {
    return mockDb.updateProductStock(id, stockQuantity);
  },
};
