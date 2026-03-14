import { orderItemsService } from "@/services/endpoints/orderItemsService";
import { ordersService } from "@/services/endpoints/ordersService";
import { productsService } from "@/services/endpoints/productsService";
import { computeLineTotals, computeOrderTotals } from "@/shared/lib/orderCalculations";
import { toFixed2 } from "@/shared/lib/format";
import type { Customer, Discount, Order, OrderItem, OrderStatus, Product } from "@/shared/types/domain";
import type { CreateOrderFormValues } from "@/features/orders/model/createOrderSchema";

interface CreateOrderWorkflowInput {
  values: CreateOrderFormValues;
  customers: Customer[];
  products: Product[];
  discounts: Discount[];
  existingOrders: Order[];
}

const createId = (prefix: string): string => `${prefix}-${crypto.randomUUID().slice(0, 10)}`;

export const createOrderWorkflow = async ({
  values,
  customers,
  products,
  discounts,
  existingOrders,
}: CreateOrderWorkflowInput) => {
  const customer = customers.find((item) => item.id === values.customerId);
  if (!customer) throw new Error("Customer not found.");

  const productById = new Map(products.map((product) => [product.id, product]));
  const createdOrderItems: OrderItem[] = [];
  const updatedProducts: Array<{ id: string; previousStock: number }> = [];

  const orderId = createId("ord");
  const orderNumber = `ORD-2026-${2000 + existingOrders.length + 1}`;

  const lines = values.lines.map((line) => {
    const product = productById.get(line.productId);
    if (!product) throw new Error("Selected product is missing.");

    const matchedDiscount = discounts.find(
      (discount) =>
        discount.customerId === values.customerId &&
        discount.status === "active" &&
        ((discount.scopeType === "product" && discount.scopeId === product.id) ||
          (discount.scopeType === "category" && discount.scopeId === product.categoryId)),
    );

    const resolvedDiscountType = line.discountValue > 0 ? line.discountType : matchedDiscount?.discountType ?? "percentage";
    const resolvedDiscountValue = line.discountValue > 0 ? line.discountValue : matchedDiscount?.value ?? 0;

    const computed = computeLineTotals({
      unitPrice: product.unitPrice,
      fixedCostPrice: product.fixedCostPrice,
      quantity: line.quantity,
      discountType: resolvedDiscountType,
      discountValue: resolvedDiscountValue,
    });

    return {
      product,
      quantity: line.quantity,
      discountType: resolvedDiscountType,
      discountValue: resolvedDiscountValue,
      ...computed,
    };
  });

  const totalCost = toFixed2(lines.reduce((sum, line) => sum + line.product.fixedCostPrice * line.quantity, 0));
  const totals = computeOrderTotals(lines, totalCost);

  const orderPayload: Order = {
    id: orderId,
    orderNumber,
    customerId: customer.id,
    orderDate: new Date(values.orderDate).toISOString(),
    status: "confirmed" satisfies OrderStatus,
    currency: "NOK",
    totalAmount: totals.totalAmount,
    totalDiscount: totals.totalDiscount,
    totalCost: totals.totalCost,
    estimatedProfit: totals.estimatedProfit,
    itemCount: totals.itemCount,
  };

  await ordersService.create(orderPayload);

  try {
    for (const line of lines) {
      const payload: OrderItem = {
        id: createId("oi"),
        orderId,
        productId: line.product.id,
        productSku: line.product.sku,
        productNameSnapshot: line.product.name,
        quantity: line.quantity,
        unit: line.product.unit,
        currency: "NOK",
        sellingPriceSnapshot: line.product.unitPrice,
        fixedCostSnapshot: line.product.fixedCostPrice,
        discountType: line.discountType,
        discountValue: line.discountValue,
        discountAmount: line.discountAmount,
        lineSubtotal: line.lineSubtotal,
        lineTotal: line.lineTotal,
        lineProfit: line.lineProfit,
      };

      const created = await orderItemsService.create(payload);
      createdOrderItems.push(created);
    }

    const stockAdjustments = new Map<string, number>();
    lines.forEach((line) => {
      stockAdjustments.set(line.product.id, (stockAdjustments.get(line.product.id) ?? 0) + line.quantity);
    });

    for (const [productId, quantity] of stockAdjustments.entries()) {
      const product = productById.get(productId);
      if (!product) continue;

      updatedProducts.push({ id: product.id, previousStock: product.stockQuantity });
      await productsService.updateStock(product.id, Math.max(0, product.stockQuantity - quantity));
    }

    return orderPayload;
  } catch (error) {
    for (const item of createdOrderItems) {
      await orderItemsService.remove(item.id);
    }

    for (const product of updatedProducts) {
      await productsService.updateStock(product.id, product.previousStock);
    }

    await ordersService.remove(orderId);

    throw error;
  }
};
