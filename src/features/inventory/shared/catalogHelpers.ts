import type { Component, ComponentProduct, Product } from "@/shared/types/domain";

export const getAvailableQuantity = (stockQuantity: number, reservedQuantity: number) =>
  Math.max(0, stockQuantity - reservedQuantity);

export const createEntityId = (prefix: string, label: string) => {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

  return `${prefix}-${slug || "item"}-${Math.random().toString(36).slice(2, 8)}`;
};

export const getProductStockHealth = (product: Product) => {
  const availableQuantity = getAvailableQuantity(
    product.stockQuantity,
    product.reservedQuantity,
  );

  if (availableQuantity <= product.reorderLevel) {
    return "critical";
  }

  if (availableQuantity <= product.reorderLevel * 1.5) {
    return "low";
  }

  return "healthy";
};

export const getComponentDerivedBasePrice = (
  component: Component,
  rows: ComponentProduct[],
  products: Product[],
) => {
  const productLookup = new Map(products.map((product) => [product.id, product]));
  const materialPrice = rows.reduce((sum, row) => {
    const product = productLookup.get(row.productId);
    return sum + (product?.basePrice ?? 0) * row.quantity;
  }, 0);

  return materialPrice + component.standardProductionCost;
};

export const getComponentDerivedCost = (
  component: Component,
  rows: ComponentProduct[],
  products: Product[],
) => {
  const productLookup = new Map(products.map((product) => [product.id, product]));
  const materialCost = rows.reduce((sum, row) => {
    const product = productLookup.get(row.productId);
    return sum + (product?.purchasePrice ?? 0) * row.quantity;
  }, 0);

  return materialCost + component.standardProductionCost;
};

export const getComponentFinancials = (
  component: Component,
  rows: ComponentProduct[],
  products: Product[],
) => ({
  materialPrice: getComponentDerivedBasePrice(
    { ...component, standardProductionCost: 0 },
    rows,
    products,
  ),
  materialCost: getComponentDerivedCost(
    { ...component, standardProductionCost: 0 },
    rows,
    products,
  ),
  derivedPrice: getComponentDerivedBasePrice(component, rows, products),
  derivedCost: getComponentDerivedCost(component, rows, products),
});
