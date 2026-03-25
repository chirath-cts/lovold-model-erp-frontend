import { toFixed2 } from "@/shared/lib/format";
import type {
  Product,
  Supplier,
  SupplierPurchaseOrder,
  SupplierPurchaseOrderItem,
} from "@/shared/types/domain";

export interface InboundTrackerRow {
  id: string;
  poNumber: string;
  supplierName: string;
  status: SupplierPurchaseOrder["status"];
  orderDate: string;
  eta: string | null;
  orderedUnits: number;
  receivedUnits: number;
  remainingUnits: number;
  lineCount: number;
  estimatedValue: number;
}

export interface SupplierPurchaseOrderDetailView {
  orderedUnits: number;
  receivedUnits: number;
  remainingUnits: number;
  estimatedValue: number;
}

export const buildInboundTrackerRows = ({
  purchaseOrders,
  purchaseOrderItems,
  suppliers,
}: {
  purchaseOrders: SupplierPurchaseOrder[];
  purchaseOrderItems: SupplierPurchaseOrderItem[];
  suppliers: Supplier[];
}): InboundTrackerRow[] => {
  const supplierLookup = new Map(suppliers.map((supplier) => [supplier.id, supplier]));

  return purchaseOrders
    .map((purchaseOrder) => {
      const items = purchaseOrderItems.filter(
        (item) => item.purchaseOrderId === purchaseOrder.id,
      );

      return {
        id: purchaseOrder.id,
        poNumber: purchaseOrder.poNumber,
        supplierName:
          supplierLookup.get(purchaseOrder.supplierId)?.name ?? "Unknown supplier",
        status: purchaseOrder.status,
        orderDate: purchaseOrder.orderDate,
        eta: purchaseOrder.eta,
        orderedUnits: items.reduce((sum, item) => sum + item.orderedQuantity, 0),
        receivedUnits: items.reduce((sum, item) => sum + item.receivedQuantity, 0),
        remainingUnits: items.reduce((sum, item) => sum + item.remainingQuantity, 0),
        lineCount: items.length,
        estimatedValue: toFixed2(
          items.reduce(
            (sum, item) => sum + item.orderedQuantity * item.unitCost,
            0,
          ),
        ),
      };
    })
    .sort(
      (left, right) =>
        new Date(right.orderDate).getTime() - new Date(left.orderDate).getTime(),
    );
};

export const buildSupplierPurchaseOrderDetailView = ({
  items,
  products,
}: {
  items: SupplierPurchaseOrderItem[];
  products: Product[];
}): SupplierPurchaseOrderDetailView => {
  const productLookup = new Map(products.map((product) => [product.id, product]));

  return {
    orderedUnits: items.reduce((sum, item) => sum + item.orderedQuantity, 0),
    receivedUnits: items.reduce((sum, item) => sum + item.receivedQuantity, 0),
    remainingUnits: items.reduce((sum, item) => sum + item.remainingQuantity, 0),
    estimatedValue: toFixed2(
      items.reduce((sum, item) => {
        const product = productLookup.get(item.productId);
        const unitCost = item.unitCost || product?.purchasePrice || 0;
        return sum + item.orderedQuantity * unitCost;
      }, 0),
    ),
  };
};
