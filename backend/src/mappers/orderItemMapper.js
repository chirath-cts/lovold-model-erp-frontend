import { numberValue } from "../lib/valueUtils.js";

export const mapOrderItem = (row) => {
  const discountPercent = numberValue(row.discount_percent, 0);
  const discountAmount = numberValue(row.discount_amount, 0);

  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    productSku: row.product_sku,
    productNameSnapshot: row.product_name,
    quantity: numberValue(row.quantity, 0),
    unit: row.product_unit,
    currency: "NOK",
    sellingPriceSnapshot: numberValue(row.unit_price, 0),
    fixedCostSnapshot: numberValue(row.unit_cost_at_sale, 0),
    discountType: discountPercent > 0 ? "percentage" : "fixed",
    discountValue: discountPercent > 0 ? discountPercent : discountAmount,
    discountAmount,
    lineSubtotal: numberValue(row.line_subtotal, 0),
    lineTotal: numberValue(row.line_total, 0),
    lineProfit: numberValue(row.profit_amount, 0),
  };
};
