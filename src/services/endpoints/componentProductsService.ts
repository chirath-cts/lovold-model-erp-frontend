import { mockDb } from "@/services/mock/mockDb";
import type { ComponentProduct } from "@/shared/types/domain";

export const componentProductsService = {
  getList(componentId?: string) {
    return mockDb.listComponentProducts(componentId);
  },
  replace(
    componentId: string,
    rows: Array<Omit<ComponentProduct, "componentId"> & { id?: string }>,
  ) {
    return mockDb.replaceComponentProducts(componentId, rows);
  },
};
