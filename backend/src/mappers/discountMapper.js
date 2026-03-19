import { dateOnly, statusFromDates } from "../lib/dateUtils.js";
import { numberValue } from "../lib/valueUtils.js";

export const mapDiscount = (row) => ({
  id: `${row.customer_id}__${row.product_id}`,
  name: `${row.product_name ?? "Product"} ${numberValue(row.discount_percent, 0)}%`,
  customerId: row.customer_id,
  scopeType: "product",
  scopeId: row.product_id,
  discountType: "percentage",
  value: numberValue(row.discount_percent, 0),
  currency: "NOK",
  startDate: dateOnly(row.start_date),
  endDate: dateOnly(row.end_date),
  status: statusFromDates(row.start_date, row.end_date, !!row.is_active),
});
