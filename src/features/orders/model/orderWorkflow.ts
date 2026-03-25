import { computeLineTotals } from "@/shared/lib/orderCalculations";
import { toFixed2 } from "@/shared/lib/format";
import type {
  Component,
  ComponentProduct,
  CustomerProduct,
  DiscountType,
  OrderItemType,
  OrderProductionStepStatus,
  OrderStatus,
  Product,
} from "@/shared/types/domain";

export interface OrderDraftLine {
  id: string;
  itemType: OrderItemType;
  itemId: string;
  quantity: string;
  discountType: DiscountType;
  discountValue: string;
  manualUnitPriceEnabled: boolean;
  manualUnitPrice: string;
}

export interface ProductionStepDraft {
  id: string;
  workCenterId: string;
  stepName: string;
  description: string;
  cost: string;
  timeHours: string;
  status?: OrderProductionStepStatus;
}

export interface CompositionRowDraft {
  id: string;
  productId: string;
  quantity: string;
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "draft",
  "confirmed",
  "reserved",
  "in_production",
  "ready",
  "dispatched",
  "delivered",
];

export const createLineId = () =>
  `line-${Math.random().toString(36).slice(2, 10)}`;

export const createProductionStepId = () =>
  `step-${Math.random().toString(36).slice(2, 10)}`;

export const createCompositionRowId = () =>
  `comp-row-${Math.random().toString(36).slice(2, 10)}`;

export const createEmptyOrderLine = (itemType: OrderItemType): OrderDraftLine => ({
  id: createLineId(),
  itemType,
  itemId: "",
  quantity: "1",
  discountType: "percentage",
  discountValue: "0",
  manualUnitPriceEnabled: false,
  manualUnitPrice: "",
});

export const createEmptyProductionStep = (): ProductionStepDraft => ({
  id: createProductionStepId(),
  workCenterId: "",
  stepName: "",
  description: "",
  cost: "0",
  timeHours: "0",
  status: "pending",
});

export const createEmptyCompositionRow = (): CompositionRowDraft => ({
  id: createCompositionRowId(),
  productId: "",
  quantity: "1",
});

export const getActiveCustomerAgreement = (
  customerProducts: CustomerProduct[],
  customerId: string,
  productId: string,
) =>
  customerProducts.find(
    (agreement) =>
      agreement.customerId === customerId &&
      agreement.productId === productId &&
      agreement.status === "active",
  );

export const getEffectiveProductPrice = (
  product: Product,
  agreement?: CustomerProduct,
) =>
  toFixed2(product.basePrice * (1 - (agreement?.discountPercent ?? 0) / 100));

export const getEffectiveProductCost = (product: Product) => product.purchasePrice;

export const getComponentEffectivePricing = ({
  component,
  rows,
  products,
  customerProducts,
  customerId,
}: {
  component: Component;
  rows: ComponentProduct[];
  products: Product[];
  customerProducts: CustomerProduct[];
  customerId: string;
}) => {
  const productLookup = new Map(products.map((product) => [product.id, product]));

  const materialPrice = rows.reduce((sum, row) => {
    const product = productLookup.get(row.productId);
    if (!product) return sum;
    const agreement = getActiveCustomerAgreement(
      customerProducts,
      customerId,
      product.id,
    );
    return sum + getEffectiveProductPrice(product, agreement) * row.quantity;
  }, 0);

  const materialCost = rows.reduce((sum, row) => {
    const product = productLookup.get(row.productId);
    if (!product) return sum;
    return sum + getEffectiveProductCost(product) * row.quantity;
  }, 0);

  return {
    unitPrice: toFixed2(materialPrice + component.standardProductionCost),
    unitCost: toFixed2(materialCost + component.standardProductionCost),
  };
};

export const getOrderLinePreview = ({
  line,
  customerId,
  products,
  components,
  componentProducts,
  customerProducts,
}: {
  line: OrderDraftLine;
  customerId: string;
  products: Product[];
  components: Component[];
  componentProducts: ComponentProduct[];
  customerProducts: CustomerProduct[];
}) => {
  const quantity = Number(line.quantity || 0);
  const discountValue = Number(line.discountValue || 0);

  if (!line.itemId || quantity <= 0) {
    return null;
  }

  if (line.itemType === "product") {
    const product = products.find((item) => item.id === line.itemId);
    if (!product) return null;

    const agreement = customerId
      ? getActiveCustomerAgreement(customerProducts, customerId, product.id)
      : undefined;
    const autoDiscount = agreement?.discountPercent ?? 0;
    const unitPrice = line.manualUnitPriceEnabled
      ? Number(line.manualUnitPrice || 0)
      : product.basePrice;
    const computed = computeLineTotals({
      unitPrice,
      fixedCostPrice: product.purchasePrice,
      quantity,
      discountType: line.discountType,
      discountValue,
    });

    return {
      itemName: product.name,
      itemSku: product.sku,
      itemUnit: product.unit,
      unitPrice,
      unitCost: product.purchasePrice,
      autoDiscount,
      breakdown: [] as Array<{ productName: string; quantity: number }>,
      ...computed,
    };
  }

  const component = components.find((item) => item.id === line.itemId);
  if (!component) return null;

  const rows = componentProducts.filter((row) => row.componentId === component.id);
  const derived = customerId
    ? getComponentEffectivePricing({
        component,
        rows,
        products,
        customerProducts,
        customerId,
      })
    : {
        unitPrice: toFixed2(
          rows.reduce((sum, row) => {
            const product = products.find((entry) => entry.id === row.productId);
            return sum + (product?.basePrice ?? 0) * row.quantity;
          }, component.standardProductionCost),
        ),
        unitCost: toFixed2(
          rows.reduce((sum, row) => {
            const product = products.find((entry) => entry.id === row.productId);
            return sum + (product?.purchasePrice ?? 0) * row.quantity;
          }, component.standardProductionCost),
        ),
      };

  const unitPrice = line.manualUnitPriceEnabled
    ? Number(line.manualUnitPrice || 0)
    : derived.unitPrice;
  const computed = computeLineTotals({
    unitPrice,
    fixedCostPrice: derived.unitCost,
    quantity,
    discountType: line.discountType,
    discountValue,
  });

  const productLookup = new Map(products.map((product) => [product.id, product]));

  return {
    itemName: component.name,
    itemSku: component.sku,
    itemUnit: component.unit,
    unitPrice,
    unitCost: derived.unitCost,
    autoDiscount: 0,
    breakdown: rows.map((row) => ({
      productName: productLookup.get(row.productId)?.name ?? "Unknown product",
      quantity: row.quantity * quantity,
    })),
    ...computed,
  };
};

export const getNextOrderStatuses = (status: OrderStatus): OrderStatus[] => {
  const index = ORDER_STATUS_FLOW.indexOf(status);
  if (index === -1 || index === ORDER_STATUS_FLOW.length - 1) return [];

  return [ORDER_STATUS_FLOW[index + 1]];
};
