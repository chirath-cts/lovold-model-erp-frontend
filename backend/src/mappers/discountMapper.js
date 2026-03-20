import { dateOnly, statusFromDates } from "../lib/dateUtils.js";
import { numberValue } from "../lib/valueUtils.js";

export const mapCustomerProduct = (row) => ({
  customerId: row.customer_id,
  productId: row.product_id,
  discountPercent: numberValue(row.discount_percent, 0),
  startDate: dateOnly(row.start_date),
  endDate: dateOnly(row.end_date),
  isActive: Boolean(row.is_active),
  status: statusFromDates(row.start_date, row.end_date, !!row.is_active),
});
