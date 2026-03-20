import { badRequestError, notFoundError } from "../lib/appError.js";
import { parseDiscountId } from "../lib/discountUtils.js";
import { sortArrayBy } from "../lib/sortUtils.js";
import { isNonNegativeNumber, numberValue } from "../lib/valueUtils.js";
import { mapCustomerProduct } from "../mappers/discountMapper.js";

const normalizeDateValue = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  return String(value);
};

const normalizeIsActive = (value, fallback = true) => {
  if (value === undefined) return fallback ? 1 : 0;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number") return value ? 1 : 0;
  if (typeof value === "string") {
    return ["1", "true", "yes", "active"].includes(value.toLowerCase()) ? 1 : 0;
  }
  return fallback ? 1 : 0;
};

export function createDiscountService({
  customerProductRepository,
  customerRepository,
  productRepository,
}) {
  const listCustomerProducts = async ({ customerId, status, query = {} } = {}) => {
    const rows = await customerProductRepository.listCustomerProductRows(customerId);
    let mapped = rows.map(mapCustomerProduct);

    if (status) {
      mapped = mapped.filter((item) => item.status === status);
    }

    const sortableColumns = new Set([
      "discountPercent",
      "startDate",
      "endDate",
      "status",
    ]);
    const sortKey =
      typeof query._sort === "string" && sortableColumns.has(query._sort)
        ? query._sort
        : "startDate";
    const sortDir = typeof query._order === "string" ? query._order : "desc";

    return sortArrayBy(mapped, sortKey, sortDir);
  };

  const createCustomerProduct = async (payload = {}) => {
    const { customerId, productId, startDate, endDate } = payload ?? {};

    if (!customerId || !productId || !isNonNegativeNumber(payload?.discountPercent)) {
      throw badRequestError("customerId, productId and discountPercent are required");
    }

    const customer = await customerRepository.existsById(customerId);
    if (!customer) throw badRequestError("Invalid customerId");

    const product = await productRepository.getProductRecordById(productId);
    if (!product) throw badRequestError("Invalid productId");

    await customerProductRepository.upsertCustomerProduct({
      customerId,
      productId,
      discountPercent: numberValue(payload.discountPercent, 0),
      startDate: normalizeDateValue(startDate) ?? null,
      endDate: normalizeDateValue(endDate) ?? null,
      isActive: normalizeIsActive(payload.isActive, true),
    });

    const row = await customerProductRepository.getCustomerProductByKeys(
      customerId,
      productId,
    );
    return mapCustomerProduct(row);
  };

  const updateCustomerProduct = async (id, payload = {}) => {
    const currentKeys = parseDiscountId(id);
    if (!currentKeys) throw badRequestError("Invalid customer product id");

    const current = await customerProductRepository.getCustomerProductByKeys(
      currentKeys.customerId,
      currentKeys.productId,
    );
    if (!current) throw notFoundError("Customer product not found");

    const customerId = payload?.customerId ?? current.customer_id;
    const productId = payload?.productId ?? current.product_id;
    const discountPercent =
      payload?.discountPercent !== undefined
        ? numberValue(payload.discountPercent, 0)
        : numberValue(current.discount_percent, 0);
    const startDate =
      normalizeDateValue(payload?.startDate) !== undefined
        ? normalizeDateValue(payload?.startDate)
        : current.start_date;
    const endDate =
      normalizeDateValue(payload?.endDate) !== undefined
        ? normalizeDateValue(payload?.endDate)
        : current.end_date;
    const isActive =
      payload?.isActive !== undefined
        ? normalizeIsActive(payload.isActive, true)
        : normalizeIsActive(current.is_active, true);

    if (!customerId || !productId || !isNonNegativeNumber(discountPercent)) {
      throw badRequestError("customerId, productId and discountPercent are required");
    }

    const customer = await customerRepository.existsById(customerId);
    if (!customer) throw badRequestError("Invalid customerId");

    const product = await productRepository.getProductRecordById(productId);
    if (!product) throw badRequestError("Invalid productId");

    await customerProductRepository.upsertCustomerProduct({
      customerId,
      productId,
      discountPercent,
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      isActive,
    });

    if (
      customerId !== currentKeys.customerId ||
      productId !== currentKeys.productId
    ) {
      await customerProductRepository.deleteCustomerProduct(
        currentKeys.customerId,
        currentKeys.productId,
      );
    }

    const row = await customerProductRepository.getCustomerProductByKeys(
      customerId,
      productId,
    );
    return mapCustomerProduct(row);
  };

  return {
    listCustomerProducts,
    createCustomerProduct,
    updateCustomerProduct,
    listDiscounts: listCustomerProducts,
    createDiscount: createCustomerProduct,
    updateDiscount: updateCustomerProduct,
  };
}
