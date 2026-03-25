import type { OrderStatus } from "@/shared/types/domain";
import { getOrderStatusStyles } from "@/features/orders/model/orderHelpers";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${getOrderStatusStyles(
        status,
      )}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
