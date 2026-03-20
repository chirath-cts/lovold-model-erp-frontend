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
  supplierRepository,
  warehouseRepository,
}) {
  const hasOwn = (payload, key) => Object.prototype.hasOwnProperty.call(payload, key);

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

      if (!isNonNegativeNumber(payload.basePrice ?? 0)) {
        throw badRequestError("basePrice must be a non-negative number");
      }

      if (!isNonNegativeNumber(payload.purchasePrice ?? 0)) {
        throw badRequestError("purchasePrice must be a non-negative number");
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

      const category = await categoryRepository.existsById(categoryId);
      if (!category) throw badRequestError("Invalid categoryId");

      const supplierRow = await supplierRepository.getDefaultSupplierId();
      const supplierId = supplierRow?.id ?? null;
      if (!supplierId) {
        throw badRequestError("No default supplier available to maintain purchase pricing");
      }

      const warehouseRow = await warehouseRepository.getPrimaryWarehouseId();
      const warehouseId = warehouseRow?.id ?? null;
      if (!warehouseId) {
        throw badRequestError("No warehouse available to maintain inventory");
      }

      const basePrice = numberValue(payload.basePrice, 0);
      const purchasePrice = numberValue(payload.purchasePrice, 0);
      const stockQuantity = integerValue(payload.stockQuantity, 0);
      const reorderLevel = integerValue(payload.reorderLevel, 0);
      const imageUrl = payload.imageUrl ?? null;

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

      await productRepository.createPrimarySupplierProduct({
        id: `sp-${id}`,
        productId: id,
        supplierId,
        supplierSku: null,
        purchasePrice,
      });

      await productRepository.createInventoryRow({
        id: `inv-${id}`,
        warehouseId,
        productId: id,
        stockQuantity,
        reorderLevel,
        updatedAt: new Date().toISOString(),
      });

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

      if (payload.basePrice !== undefined && !isNonNegativeNumber(payload.basePrice)) {
        throw badRequestError("basePrice must be a non-negative number");
      }

      if (
        payload.purchasePrice !== undefined &&
        !isNonNegativeNumber(payload.purchasePrice)
      ) {
        throw badRequestError("purchasePrice must be a non-negative number");
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

      const hasImageUrlUpdate = Object.prototype.hasOwnProperty.call(payload, "imageUrl");
      const imageUrlInput = payload.imageUrl;

      if (hasImageUrlUpdate && imageUrlInput !== null && typeof imageUrlInput !== "string") {
        throw badRequestError("imageUrl must be a string or null");
      }

      const primarySupplier = await productRepository.getPrimarySupplierProductByProductId(id);
      const needsPurchasePriceWrite = hasOwn(payload, "purchasePrice");
      const needsInventoryWrite = hasOwn(payload, "stockQuantity") || hasOwn(payload, "reorderLevel");

      let supplierId = primarySupplier?.supplier_id ?? null;
      if (needsPurchasePriceWrite && !supplierId) {
        const supplierRow = await supplierRepository.getDefaultSupplierId();
        supplierId = supplierRow?.id ?? null;
        if (!supplierId) {
          throw badRequestError("No default supplier available to maintain purchase pricing");
        }
      }

      let inventoryRowId = null;
      let warehouseId = null;
      if (needsInventoryWrite) {
        const inventoryRow = await productRepository.getInventoryRowByProductId(id);
        inventoryRowId = inventoryRow?.id ?? null;

        if (!inventoryRowId) {
          const warehouseRow = await warehouseRepository.getPrimaryWarehouseId();
          warehouseId = warehouseRow?.id ?? null;
          if (!warehouseId) {
            throw badRequestError("No warehouse available to maintain inventory");
          }
          inventoryRowId = `inv-${id}`;
        }
      }

      const next = {
        category_id: payload.categoryId ?? current.category_id,
        name: payload.name ?? current.name,
        sku: payload.sku ?? current.sku,
        description: payload.description ?? current.description,
        image_url: hasImageUrlUpdate ? imageUrlInput : current.image_url,
        base_price:
          payload.basePrice !== undefined
            ? numberValue(payload.basePrice, current.base_price)
            : current.base_price,
        unit: payload.unit ?? current.unit,
        status: payload.status ?? current.status,
      };

      await productRepository.updateProductRecord(id, next);

      if (needsPurchasePriceWrite) {
        const purchasePrice = numberValue(payload.purchasePrice, 0);

        if (primarySupplier?.id) {
          await productRepository.updatePrimarySupplierPurchasePrice(primarySupplier.id, purchasePrice);
        } else {
          await productRepository.createPrimarySupplierProduct({
            id: `sp-${id}`,
            productId: id,
            supplierId,
            supplierSku: null,
            purchasePrice,
          });
        }
      }

      if (needsInventoryWrite) {
        if (warehouseId) {
          await productRepository.createInventoryRow({
            id: inventoryRowId,
            warehouseId,
            productId: id,
            stockQuantity: 0,
            reorderLevel: 0,
            updatedAt: new Date().toISOString(),
          });
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
