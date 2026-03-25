import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFolder = path.join(__dirname, "data");
const outputFile = path.join(__dirname, "db.json");

const canonicalFiles = [
  "businessSettings.json",
  "categories.json",
  "products.json",
  "components.json",
  "componentProducts.json",
  "customers.json",
  "customerProducts.json",
  "suppliers.json",
  "supplierPurchaseOrders.json",
  "supplierPurchaseOrderItems.json",
  "orders.json",
  "orderItems.json",
  "orderProductionSteps.json",
  "workCenters.json",
  "users.json",
];

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toIsoDate = (value) => {
  const date = parseDate(value);
  return date ? date.toISOString() : null;
};

const deriveCustomerProductStatus = (agreement) => {
  if (!agreement?.isActive) return "expired";

  const today = new Date();
  const start = parseDate(agreement.startDate);
  const end = parseDate(agreement.endDate);

  if (start && start.getTime() > today.getTime()) return "future";
  if (end && end.getTime() < today.getTime()) return "expired";
  return "active";
};

let db = {};

for (const file of canonicalFiles) {
  const filePath = path.join(dataFolder, file);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing canonical mock file: ${file}`);
  }

  const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  db = { ...db, ...json };
}

db.customerProducts = Array.isArray(db.customerProducts)
  ? db.customerProducts.map((agreement) => ({
      ...agreement,
      startDate: toIsoDate(agreement.startDate),
      endDate: toIsoDate(agreement.endDate),
      status: deriveCustomerProductStatus(agreement),
    }))
  : [];

db.supplierPurchaseOrderItems = Array.isArray(db.supplierPurchaseOrderItems)
  ? db.supplierPurchaseOrderItems.map((item) => ({
      ...item,
      orderedQuantity: Number(item.orderedQuantity ?? 0),
      receivedQuantity: Number(item.receivedQuantity ?? 0),
      remainingQuantity: Math.max(
        0,
        Number(item.orderedQuantity ?? 0) - Number(item.receivedQuantity ?? 0),
      ),
      unitCost: Number(item.unitCost ?? 0),
    }))
  : [];

db.supplierPurchaseOrders = Array.isArray(db.supplierPurchaseOrders)
  ? db.supplierPurchaseOrders.map((purchaseOrder) => ({
      ...purchaseOrder,
      eta: toIsoDate(purchaseOrder.eta),
      orderDate: toIsoDate(purchaseOrder.orderDate),
    }))
  : [];

const itemCountByOrderId = Array.isArray(db.orderItems)
  ? db.orderItems.reduce((map, item) => {
      map.set(item.orderId, (map.get(item.orderId) ?? 0) + 1);
      return map;
    }, new Map())
  : new Map();

db.orders = Array.isArray(db.orders)
  ? db.orders.map((order) => ({
      ...order,
      orderDate: toIsoDate(order.orderDate),
      materialAvailabilityEta: toIsoDate(order.materialAvailabilityEta),
      productionCompletionEta: toIsoDate(order.productionCompletionEta),
      deliveryEta: toIsoDate(order.deliveryEta),
      promisedEta: toIsoDate(order.promisedEta),
      itemCount: itemCountByOrderId.get(order.id) ?? 0,
    }))
  : [];

db.orderProductionSteps = Array.isArray(db.orderProductionSteps)
  ? db.orderProductionSteps.map((step) => ({
      ...step,
      cost: Number(step.cost ?? 0),
      timeHours: Number(step.timeHours ?? 0),
    }))
  : [];

fs.writeFileSync(outputFile, JSON.stringify(db, null, 2));

console.log("Mock DB generated successfully");
