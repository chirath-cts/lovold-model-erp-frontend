import { badRequestError, notFoundError } from "../lib/appError.js";
import { numberValue } from "../lib/valueUtils.js";
import { mapOrderItem } from "../mappers/orderItemMapper.js";

export function createOrderItemService({
  orderItemRepository,
  orderRepository,
  productRepository,
}) {
  return {
    async listOrderItems({ orderId, query }) {
      const rows = await orderItemRepository.listOrderItems({
        orderId,
        sortQuery: query,
      });
      return rows.map(mapOrderItem);
    },

    async createOrderItem(payload) {
      if (!payload?.id || !payload?.orderId || !payload?.productId) {
        throw badRequestError("id, orderId and productId are required");
      }

      const order = await orderRepository.getOrderRecordById(payload.orderId);
      if (!order) throw badRequestError("Invalid orderId");

      const product = await productRepository.getProductPricingById(payload.productId);
      if (!product) throw badRequestError("Invalid productId");

      const quantity = numberValue(payload.quantity, 0);
      const unitPrice = numberValue(
        payload.sellingPriceSnapshot ?? payload.unitPrice,
        0,
      );
      const lineSubtotal =
        payload.lineSubtotal !== undefined
          ? numberValue(payload.lineSubtotal, 0)
          : quantity * unitPrice;
      const discountAmount = numberValue(payload.discountAmount, 0);
      const discountPercent =
        (payload.discountType ?? "percentage") === "percentage"
          ? numberValue(payload.discountValue, 0)
          : lineSubtotal > 0
            ? (discountAmount / lineSubtotal) * 100
            : 0;

      await orderItemRepository.createOrderItem({
        id: payload.id,
        productId: payload.productId,
        orderId: payload.orderId,
        quantity,
        unitPrice,
        lineSubtotal,
        discountPercent,
        discountAmount,
        lineTotal: numberValue(payload.lineTotal, 0),
        unitCostAtSale: numberValue(
          payload.fixedCostSnapshot ??
            payload.unitCostAtSale ??
            product.purchase_price ??
            product.base_price,
          0,
        ),
        profitAmount: numberValue(payload.lineProfit ?? payload.profitAmount, 0),
      });

      const row = await orderItemRepository.getOrderItemById(payload.id);
      return mapOrderItem(row);
    },

    async deleteOrderItem(id) {
      const result = await orderItemRepository.deleteOrderItem(id);
      if ((result?.changes ?? 0) === 0) throw notFoundError("Order item not found");
    },
  };
}
