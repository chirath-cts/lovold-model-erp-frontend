import { mockDb, type ProductFilters } from "@/services/mock/mockDb";
import type {
  CreateProductPayload,
  UpdateProductPayload,
} from "@/shared/types/domain";

export type { ProductFilters };

export const productsService = {
  getList(filters?: ProductFilters) {
    return mockDb.listProducts(filters);
  },
  getById(id: string) {
    return mockDb.getProductById(id);
  },
  create(payload: CreateProductPayload) {
    return mockDb.addProduct(payload);
  },
  update(id: string, payload: UpdateProductPayload) {
    return mockDb.updateProduct(id, payload);
  },
  updateStock(id: string, stockQuantity: number) {
    return mockDb.updateProductStock(id, stockQuantity);
  },
};
