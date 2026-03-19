import { badRequestError, notFoundError } from "../lib/appError.js";
import {
  parseDiscountId,
  resolveDiscountPercent,
} from "../lib/discountUtils.js";
import { sortArrayBy } from "../lib/sortUtils.js";
import { numberValue } from "../lib/valueUtils.js";
import { mapDiscount } from "../mappers/discountMapper.js";

export function createDiscountService({
  customerProductRepository,
  customerRepository,
  productRepository,
}) {
  const resolveScopedProducts = async (scopeType, scopeId) => {
    if (scopeType === "product") {
      const product = await productRepository.getProductScopeById(scopeId);
      if (!product) throw badRequestError("Invalid scopeId for product");
      return [product];
    }

    if (scopeType === "category") {
      const productRows = await productRepository.listProductScopeByCategory(scopeId);
      if (productRows.length === 0) {
        throw badRequestError("No products found for category scopeId");
      }
      return productRows;
    }

    throw badRequestError("scopeType must be 'product' or 'category'");
  };

  return {
    async listDiscounts({ customerId, status, query }) {
      const rows = await customerProductRepository.listDiscountRows(customerId);
      let mapped = rows.map(mapDiscount);

      if (status) {
        mapped = mapped.filter((item) => item.status === status);
      }

      const sortableColumns = new Set(["startDate", "endDate", "status", "name"]);
      const sortKey =
        typeof query._sort === "string" && sortableColumns.has(query._sort)
          ? query._sort
          : "startDate";
      const sortDir = typeof query._order === "string" ? query._order : "desc";

      return sortArrayBy(mapped, sortKey, sortDir);
    },

    async createDiscount(payload) {
      if (!payload?.customerId || !payload?.scopeType || !payload?.scopeId) {
        throw badRequestError("customerId, scopeType and scopeId are required");
      }

      const customer = await customerRepository.existsById(payload.customerId);
      if (!customer) throw badRequestError("Invalid customerId");

      const productRows = await resolveScopedProducts(payload.scopeType, payload.scopeId);
      const isActive = payload.status === "expired" ? 0 : 1;

      for (const product of productRows) {
        const discountPercent = resolveDiscountPercent(
          payload.discountType,
          payload.value,
          numberValue(product.base_price, 0),
        );

        await customerProductRepository.upsertCustomerProduct({
          customerId: payload.customerId,
          productId: product.id,
          discountPercent,
          startDate: payload.startDate ?? null,
          endDate: payload.endDate ?? null,
          isActive,
        });
      }

      const row = await customerProductRepository.getDiscountByKeys(
        payload.customerId,
        productRows[0].id,
      );
      return mapDiscount(row);
    },

    async updateDiscount(id, payload) {
      const currentKeys = parseDiscountId(id);
      if (!currentKeys) throw badRequestError("Invalid discount id");

      const current = await customerProductRepository.getDiscountByKeys(
        currentKeys.customerId,
        currentKeys.productId,
      );
      if (!current) throw notFoundError("Discount not found");

      const targetCustomerId = payload.customerId ?? current.customer_id;
      const scopeType = payload.scopeType ?? "product";
      const scopeId = payload.scopeId ?? current.product_id;

      const customer = await customerRepository.existsById(targetCustomerId);
      if (!customer) throw badRequestError("Invalid customerId");

      const productRows = await resolveScopedProducts(scopeType, scopeId);
      const nextStartDate = payload.startDate ?? current.start_date ?? null;
      const nextEndDate = payload.endDate ?? current.end_date ?? null;
      const nextIsActive = payload.status
        ? payload.status === "expired"
          ? 0
          : 1
        : current.is_active;

      for (const product of productRows) {
        const discountPercent =
          payload.value !== undefined
            ? resolveDiscountPercent(
                payload.discountType ?? "percentage",
                payload.value,
                numberValue(product.base_price, 0),
              )
            : numberValue(current.discount_percent, 0);

        await customerProductRepository.upsertCustomerProduct({
          customerId: targetCustomerId,
          productId: product.id,
          discountPercent,
          startDate: nextStartDate,
          endDate: nextEndDate,
          isActive: nextIsActive,
        });
      }

      const targetKeys = new Set(
        productRows.map((product) => `${targetCustomerId}__${product.id}`),
      );

      if (!targetKeys.has(id)) {
        await customerProductRepository.deleteCustomerProduct(
          currentKeys.customerId,
          currentKeys.productId,
        );
      }

      const row = await customerProductRepository.getDiscountByKeys(
        targetCustomerId,
        productRows[0].id,
      );
      return mapDiscount(row);
    },
  };
}
