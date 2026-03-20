export const parseDiscountId = (id) => {
  if (typeof id !== "string" || !id.includes("__")) return null;

  const [customerId, productId] = id.split("__");
  if (!customerId || !productId) return null;

  return { customerId, productId };
};
