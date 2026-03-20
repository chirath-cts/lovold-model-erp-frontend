import { integerValue, numberValue } from "../lib/valueUtils.js";

export const mapWarehouse = (row) => ({
  id: row.id,
  name: row.name,
  location: row.location,
});

export const mapWarehouseProduct = (row) => ({
  id: row.id,
  warehouseId: row.warehouse_id,
  productId: row.product_id,
  supplierId: row.supplier_id,
  stockQuantity: integerValue(row.stock_quantity, 0),
  reorderLevel: integerValue(row.reorder_level, 0),
  supplierPrice: numberValue(row.supplier_price, 0),
  supplierDiscount: numberValue(row.supplier_discount, 0),
});
