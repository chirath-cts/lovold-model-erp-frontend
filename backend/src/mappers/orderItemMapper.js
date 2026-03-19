import { numberValue } from "../lib/valueUtils.js";

export const mapOrderItem = (row) => ({
  id: row.id,
  orderId: row.order_id,
  productId: row.product_id,
  quantity: numberValue(row.quantity, 0),
  unitPrice: numberValue(row.unit_price, 0),
  lineSubtotal: numberValue(row.line_subtotal, 0),
  discountPercent: numberValue(row.discount_percent, 0),
  discountAmount: numberValue(row.discount_amount, 0),
  lineTotal: numberValue(row.line_total, 0),
  unitCostAtSale: numberValue(row.unit_cost_at_sale, 0),
  profitAmount: numberValue(row.profit_amount, 0),
  productSku: row.product_sku ?? null,
  productName: row.product_name ?? null,
  productUnit: row.product_unit ?? null,
});
