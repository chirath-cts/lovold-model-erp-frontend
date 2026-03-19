import { badRequestError, notFoundError } from "../lib/appError.js";
import {
  integerValue,
  isNonNegativeInteger,
  isNonNegativeNumber,
  numberValue,
} from "../lib/valueUtils.js";
import { mapProduct } from "../mappers/productMapper.js";

export function createProductService({
  categoryRepository,
  productRepository,
  warehouseRepository,
}) {
  const ensureInventoryRow = async (productId) => {
    const existing = await productRepository.getInventoryRowByProductId(productId);
    if (existing) return existing.id;

    const warehouseRow = await warehouseRepository.getPrimaryWarehouseId();
    const warehouseId = warehouseRow?.id ?? null;
    if (!warehouseId) return null;

    const inventoryId = `inv-${productId}`;
    await productRepository.createInventoryRow({
      id: inventoryId,
      warehouseId,
      productId,
      stockQuantity: 0,
      reorderLevel: 0,
      updatedAt: new Date().toISOString(),
    });

    const created = await productRepository.getInventoryRowByProductId(productId);
    return created?.id ?? null;
  };

  return {
    async listProducts({ categoryId, q, query }) {
      const rows = await productRepository.listProducts({
        categoryId,
        search: q,
        sortQuery: query,
      });

      return rows.map(mapProduct);
    },

    async createProduct(payload) {
      const { id, name, categoryId, unit } = payload ?? {};
      if (!id || !name || !categoryId || !unit) {
        throw badRequestError("id, name, categoryId, and unit are required");
      }

      if (!isNonNegativeNumber(payload.unitPrice ?? 0)) {
        throw badRequestError("unitPrice must be a non-negative number");
      }

      if (!isNonNegativeNumber(payload.fixedCostPrice ?? 0)) {
        throw badRequestError("fixedCostPrice must be a non-negative number");
      }

      if (!isNonNegativeInteger(payload.stockQuantity ?? 0)) {
        throw badRequestError("stockQuantity must be a non-negative integer");
      }

      if (!isNonNegativeInteger(payload.reorderLevel ?? 0)) {
        throw badRequestError("reorderLevel must be a non-negative integer");
      }

      if (
        payload.imageUrl !== undefined &&
        payload.imageUrl !== null &&
        typeof payload.imageUrl !== "string"
      ) {
        throw badRequestError("imageUrl must be a string or null");
      }

      if (
        payload.image_url !== undefined &&
        payload.image_url !== null &&
        typeof payload.image_url !== "string"
      ) {
        throw badRequestError("image_url must be a string or null");
      }

      const category = await categoryRepository.existsById(categoryId);
      if (!category) throw badRequestError("Invalid categoryId");

      const basePrice = numberValue(payload.unitPrice ?? payload.fixedCostPrice, 0);
      const stockQuantity = integerValue(payload.stockQuantity, 0);
      const reorderLevel = integerValue(payload.reorderLevel, 0);
      const imageUrl = payload.imageUrl ?? payload.image_url ?? null;

      await productRepository.createProduct({
        id,
        categoryId,
        name,
        sku: typeof payload.sku === "string" ? payload.sku : "",
        description: typeof payload.description === "string" ? payload.description : "",
        imageUrl,
        basePrice,
        unit,
        status: payload.status === "inactive" ? "inactive" : "active",
      });

      const warehouseRow = await warehouseRepository.getPrimaryWarehouseId();
      const warehouseId = warehouseRow?.id ?? null;
      if (warehouseId) {
        await productRepository.createInventoryRow({
          id: `inv-${id}`,
          warehouseId,
          productId: id,
          stockQuantity,
          reorderLevel,
          updatedAt: new Date().toISOString(),
        });
      }

      const created = await productRepository.getProductById(id);
      return mapProduct(created);
    },

    async updateProduct(id, payload) {
      const current = await productRepository.getProductRecordById(id);
      if (!current) throw notFoundError("Product not found");

      if (payload.categoryId !== undefined) {
        if (typeof payload.categoryId !== "string" || !payload.categoryId) {
          throw badRequestError("categoryId must be a non-empty string");
        }

        const category = await categoryRepository.existsById(payload.categoryId);
        if (!category) throw badRequestError("Invalid categoryId");
      }

      if (payload.unitPrice !== undefined && !isNonNegativeNumber(payload.unitPrice)) {
        throw badRequestError("unitPrice must be a non-negative number");
      }

      if (
        payload.fixedCostPrice !== undefined &&
        !isNonNegativeNumber(payload.fixedCostPrice)
      ) {
        throw badRequestError("fixedCostPrice must be a non-negative number");
      }

      if (
        payload.stockQuantity !== undefined &&
        !isNonNegativeInteger(payload.stockQuantity)
      ) {
        throw badRequestError("stockQuantity must be a non-negative integer");
      }

      if (
        payload.reorderLevel !== undefined &&
        !isNonNegativeInteger(payload.reorderLevel)
      ) {
        throw badRequestError("reorderLevel must be a non-negative integer");
      }

      const hasImageUrlField = Object.prototype.hasOwnProperty.call(payload, "imageUrl");
      const hasImageUrlSnakeField = Object.prototype.hasOwnProperty.call(payload, "image_url");
      const hasImageUrlUpdate = hasImageUrlField || hasImageUrlSnakeField;
      const imageUrlInput = hasImageUrlField ? payload.imageUrl : payload.image_url;

      if (hasImageUrlUpdate && imageUrlInput !== null && typeof imageUrlInput !== "string") {
        throw badRequestError("imageUrl must be a string or null");
      }

      const next = {
        category_id: payload.categoryId ?? current.category_id,
        name: payload.name ?? current.name,
        sku: payload.sku ?? current.sku,
        description: payload.description ?? current.description,
        image_url: hasImageUrlUpdate ? imageUrlInput : current.image_url,
        base_price:
          payload.unitPrice !== undefined
            ? numberValue(payload.unitPrice, current.base_price)
            : payload.fixedCostPrice !== undefined
              ? numberValue(payload.fixedCostPrice, current.base_price)
              : current.base_price,
        unit: payload.unit ?? current.unit,
        status: payload.status ?? current.status,
      };

      await productRepository.updateProductRecord(id, next);

      if (payload.stockQuantity !== undefined || payload.reorderLevel !== undefined) {
        const inventoryRowId = await ensureInventoryRow(id);
        if (!inventoryRowId) {
          throw badRequestError("No warehouse available to maintain inventory");
        }

        if (payload.stockQuantity !== undefined) {
          await productRepository.resetInventoryStock(id);
          await productRepository.updateInventoryStock(
            inventoryRowId,
            payload.stockQuantity,
            new Date().toISOString(),
          );
        }

        if (payload.reorderLevel !== undefined) {
          await productRepository.resetInventoryReorderLevel(id);
          await productRepository.updateInventoryReorderLevel(
            inventoryRowId,
            payload.reorderLevel,
            new Date().toISOString(),
          );
        }
      }

      const updated = await productRepository.getProductById(id);
      return mapProduct(updated);
    },
  };
}
