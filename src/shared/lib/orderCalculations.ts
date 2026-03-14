import type { DiscountType } from "@/shared/types/domain";
import { toFixed2 } from "@/shared/lib/format";

export interface OrderLineInput {
  unitPrice: number;
  fixedCostPrice: number;
  quantity: number;
  discountType: DiscountType;
  discountValue: number;
}

export interface OrderLineComputed {
  discountAmount: number;
  lineSubtotal: number;
  lineTotal: number;
  lineProfit: number;
}

export interface OrderTotals {
  totalAmount: number;
  totalDiscount: number;
  totalCost: number;
  estimatedProfit: number;
  itemCount: number;
}

export const computeLineTotals = (input: OrderLineInput): OrderLineComputed => {
  const { unitPrice, quantity, fixedCostPrice, discountType, discountValue } = input;

  const lineSubtotal = toFixed2(unitPrice * quantity);
  const discountAmount =
    discountType === "percentage"
      ? toFixed2(lineSubtotal * (discountValue / 100))
      : toFixed2(discountValue * quantity);

  const lineTotal = toFixed2(lineSubtotal - discountAmount);
  const lineProfit = toFixed2(unitPrice * quantity - discountAmount - fixedCostPrice * quantity);

  return {
    discountAmount,
    lineSubtotal,
    lineTotal,
    lineProfit,
  };
};

export const computeOrderTotals = (lines: OrderLineComputed[], totalCost: number): OrderTotals => {
  const totalAmount = toFixed2(lines.reduce((sum, line) => sum + line.lineTotal, 0));
  const totalDiscount = toFixed2(lines.reduce((sum, line) => sum + line.discountAmount, 0));
  const estimatedProfit = toFixed2(lines.reduce((sum, line) => sum + line.lineProfit, 0));

  return {
    totalAmount,
    totalDiscount,
    totalCost: toFixed2(totalCost),
    estimatedProfit,
    itemCount: lines.length,
  };
};
