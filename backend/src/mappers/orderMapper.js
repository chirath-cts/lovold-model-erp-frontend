import { integerValue, numberValue } from "../lib/valueUtils.js";

export const mapOrder = (row) => ({
  id: row.id,
  orderNumber: row.order_number,
  customerId: row.customer_id,
  orderDate: row.order_date,
  status: row.status,
  currency: row.currency,
  subtotal: numberValue(row.subtotal, 0),
  discountTotal: numberValue(row.discount_total, 0),
  costTotal: numberValue(row.cost_total, 0),
  profitTotal: numberValue(row.profit_total, 0),
  grandTotal: numberValue(row.grand_total, 0),
  itemCount: integerValue(row.item_count, 0),
});
