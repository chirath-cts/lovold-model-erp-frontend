import { integerValue, numberValue } from "../lib/valueUtils.js";

export const mapProduct = (row) => ({
  id: row.id,
  name: row.name,
  sku: row.sku,
  categoryId: row.category_id,
  imageUrl: row.image_url ?? null,
  unitPrice: numberValue(row.base_price, 0),
  fixedCostPrice: numberValue(row.purchase_price ?? row.base_price, 0),
  currency: "NOK",
  unit: row.unit,
  stockQuantity: integerValue(row.stock_quantity, 0),
  reorderLevel: integerValue(row.reorder_level, 0),
  description: row.description,
  status: row.status,
});
