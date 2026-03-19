import { numberValue } from "./valueUtils.js";

export const parseDiscountId = (id) => {
  if (typeof id !== "string" || !id.includes("__")) return null;

  const [customerId, productId] = id.split("__");
  if (!customerId || !productId) return null;

  return { customerId, productId };
};

export const resolveDiscountPercent = (discountType, value, basePrice) => {
  const normalizedType = discountType === "fixed" ? "fixed" : "percentage";
  const normalizedValue = numberValue(value, 0);

  if (normalizedType === "percentage") return normalizedValue;
  if (basePrice <= 0) return 0;

  return (normalizedValue / basePrice) * 100;
};
