import { badRequestError, notFoundError } from "../lib/appError.js";
import { numberValue } from "../lib/valueUtils.js";
import { mapOrder } from "../mappers/orderMapper.js";

export function createOrderService({ customerRepository, orderRepository }) {
  return {
    async listOrders({ customerId, status, query }) {
      const rows = await orderRepository.listOrders({
        customerId,
        status,
        sortQuery: query,
      });
      return rows.map(mapOrder);
    },

    async createOrder(payload) {
      if (!payload?.id || !payload?.customerId) {
        throw badRequestError("id and customerId are required");
      }

      const customer = await customerRepository.existsById(payload.customerId);
      if (!customer) throw badRequestError("Invalid customerId");

      const grandTotal = numberValue(payload.grandTotal, 0);
      const discountTotal = numberValue(payload.discountTotal, 0);

      await orderRepository.createOrder({
        id: payload.id,
        orderNumber: payload.orderNumber ?? null,
        customerId: payload.customerId,
        orderDate: payload.orderDate ?? null,
        status: payload.status ?? "draft",
        currency: payload.currency ?? "NOK",
        subtotal: numberValue(payload.subtotal, grandTotal + discountTotal),
        discountTotal,
        costTotal: numberValue(payload.costTotal, 0),
        profitTotal: numberValue(payload.profitTotal, 0),
        grandTotal,
      });

      const row = await orderRepository.getOrderById(payload.id);
      return mapOrder(row);
    },

    async updateOrder(id, payload) {
      const current = await orderRepository.getOrderRecordById(id);
      if (!current) throw notFoundError("Order not found");

      if (payload.customerId !== undefined) {
        const customer = await customerRepository.existsById(payload.customerId);
        if (!customer) throw badRequestError("Invalid customerId");
      }

      const nextGrandTotal =
        payload.grandTotal !== undefined
          ? numberValue(payload.grandTotal, current.grand_total)
          : numberValue(current.grand_total, 0);

      const nextDiscountTotal =
        payload.discountTotal !== undefined
          ? numberValue(payload.discountTotal, current.discount_total)
          : numberValue(current.discount_total, 0);

      await orderRepository.updateOrder(id, {
        orderNumber: payload.orderNumber ?? current.order_number,
        customerId: payload.customerId ?? current.customer_id,
        orderDate: payload.orderDate ?? current.order_date,
        status: payload.status ?? current.status,
        currency: payload.currency ?? current.currency,
        subtotal:
          payload.subtotal !== undefined
            ? numberValue(payload.subtotal, current.subtotal)
            : numberValue(current.subtotal, nextGrandTotal + nextDiscountTotal),
        discountTotal: nextDiscountTotal,
        costTotal:
          payload.costTotal !== undefined
            ? numberValue(payload.costTotal, current.cost_total)
            : numberValue(current.cost_total, 0),
        profitTotal:
          payload.profitTotal !== undefined
            ? numberValue(payload.profitTotal, current.profit_total)
            : numberValue(current.profit_total, 0),
        grandTotal: nextGrandTotal,
      });

      const row = await orderRepository.getOrderById(id);
      return mapOrder(row);
    },

    async deleteOrder(id) {
      const result = await orderRepository.deleteOrder(id);
      if ((result?.changes ?? 0) === 0) throw notFoundError("Order not found");
    },
  };
}
