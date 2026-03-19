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
  profitAmount: number;
}

export interface OrderTotals {
  subtotal: number;
  discountTotal: number;
  costTotal: number;
  profitTotal: number;
  grandTotal: number;
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
  const profitAmount = toFixed2(
    unitPrice * quantity - discountAmount - fixedCostPrice * quantity,
  );

  return {
    discountAmount,
    lineSubtotal,
    lineTotal,
    profitAmount,
  };
};

export const computeOrderTotals = (lines: OrderLineComputed[], totalCost: number): OrderTotals => {
  const subtotal = toFixed2(lines.reduce((sum, line) => sum + line.lineSubtotal, 0));
  const discountTotal = toFixed2(lines.reduce((sum, line) => sum + line.discountAmount, 0));
  const grandTotal = toFixed2(lines.reduce((sum, line) => sum + line.lineTotal, 0));
  const profitTotal = toFixed2(lines.reduce((sum, line) => sum + line.profitAmount, 0));

  return {
    subtotal,
    discountTotal,
    costTotal: toFixed2(totalCost),
    profitTotal,
    grandTotal,
    itemCount: lines.length,
  };
};
