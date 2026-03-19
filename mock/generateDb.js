import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFolder = path.join(__dirname, "data");
const outputFile = path.join(__dirname, "db.json");

const parseDate = (dateLike) => {
  if (!dateLike) return null;
  const date = new Date(dateLike);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toIsoDateOnly = (dateLike) => {
  const date = parseDate(dateLike);
  if (!date) return null;
  return date.toISOString().slice(0, 10);
};

const deriveDiscountStatus = (item) => {
  if (!item?.isActive) return "expired";

  const today = new Date();
  const start = parseDate(item.startDate);
  const end = parseDate(item.endDate);

  if (start && start.getTime() > today.getTime()) return "future";
  if (end && end.getTime() < today.getTime()) return "expired";
  return "active";
};

const buildCompatibilityCollections = (canonical) => {
  const products = Array.isArray(canonical.products) ? canonical.products : [];
  const categories = Array.isArray(canonical.categories) ? canonical.categories : [];
  const orderProducts = Array.isArray(canonical.orderProducts) ? canonical.orderProducts : [];
  const customerProducts = Array.isArray(canonical.customerProducts) ? canonical.customerProducts : [];
  const inventories = Array.isArray(canonical.inventories) ? canonical.inventories : [];
  const supplierProducts = Array.isArray(canonical.supplierProducts) ? canonical.supplierProducts : [];

  const productById = new Map(products.map((product) => [product.id, product]));
  const primarySupplierByProductId = new Map();
  const inventoryTotalsByProductId = new Map();

  for (const supplierProduct of supplierProducts) {
    const current = primarySupplierByProductId.get(supplierProduct.productId);

    if (!current) {
      primarySupplierByProductId.set(supplierProduct.productId, supplierProduct);
      continue;
    }

    if (!current.isPrimarySupplier && supplierProduct.isPrimarySupplier) {
      primarySupplierByProductId.set(supplierProduct.productId, supplierProduct);
    }
  }

  for (const inventory of inventories) {
    const current = inventoryTotalsByProductId.get(inventory.productId) ?? {
      stockQuantity: 0,
      reorderLevel: 0,
    };

    inventoryTotalsByProductId.set(inventory.productId, {
      stockQuantity: current.stockQuantity + Number(inventory.stockQuantity ?? 0),
      reorderLevel: current.reorderLevel + Number(inventory.reorderLevel ?? 0),
    });
  }

  const runtimeProducts = products.map((product) => {
    const inventory = inventoryTotalsByProductId.get(product.id);
    const supplierProduct = primarySupplierByProductId.get(product.id);

    return {
      ...product,
      purchasePrice: Number(supplierProduct?.purchasePrice ?? product.basePrice ?? 0),
      stockQuantity: Number(inventory?.stockQuantity ?? 0),
      reorderLevel: Number(inventory?.reorderLevel ?? 0),
    };
  });

  const orderItems = orderProducts.map((orderProduct) => {
    const product = productById.get(orderProduct.productId);
    const discountPercent = Number(orderProduct.discountPercent ?? 0);

    return {
      id: orderProduct.id,
      orderId: orderProduct.orderId,
      productId: orderProduct.productId,
      productSku: product?.sku ?? null,
      productName: product?.name ?? null,
      quantity: Number(orderProduct.quantity ?? 0),
      productUnit: product?.unit ?? null,
      unitPrice: Number(orderProduct.unitPrice ?? 0),
      discountPercent,
      discountAmount: Number(orderProduct.discountAmount ?? 0),
      lineSubtotal: Number(orderProduct.lineSubtotal ?? 0),
      lineTotal: Number(orderProduct.lineTotal ?? 0),
      unitCostAtSale: Number(orderProduct.unitCostAtSale ?? orderProduct.unitPrice ?? 0),
      profitAmount: Number(orderProduct.profitAmount ?? 0),
    };
  });

  const discounts = customerProducts.map((customerProduct) => ({
    id: `${customerProduct.customerId}__${customerProduct.productId}`,
    name: `Discount ${Number(customerProduct.discountPercent ?? 0)}%`,
    customerId: customerProduct.customerId,
    scopeType: "product",
    scopeId: customerProduct.productId,
    discountType: "percentage",
    value: Number(customerProduct.discountPercent ?? 0),
    currency: "NOK",
    startDate: toIsoDateOnly(customerProduct.startDate),
    endDate: toIsoDateOnly(customerProduct.endDate),
    status: deriveDiscountStatus(customerProduct),
  }));

  const warehouseProducts = inventories.map((inventory) => {
    const supplierProduct = primarySupplierByProductId.get(inventory.productId);
    return {
      id: inventory.id,
      warehouseId: inventory.warehouseId,
      productId: inventory.productId,
      supplierId: supplierProduct?.supplierId ?? null,
      stockQuantity: Number(inventory.stockQuantity ?? 0),
      reorderLevel: Number(inventory.reorderLevel ?? 0),
      supplierPrice: Number(supplierProduct?.purchasePrice ?? 0),
      supplierDiscount: Number(supplierProduct?.supplierDiscountPercent ?? 0),
    };
  });

  return {
    products: runtimeProducts,
    productCategories: categories,
    orderItems,
    discounts,
    warehouseProducts,
  };
};

let db = {};

for (const file of fs.readdirSync(dataFolder)) {
  const filePath = path.join(dataFolder, file);
  try {
    const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    db = { ...db, ...json };
  } catch (err) {
    console.error(`Error parsing ${file}:`, err.message);
  }
}

db = {
  ...db,
  ...buildCompatibilityCollections(db),
};

fs.writeFileSync(outputFile, JSON.stringify(db, null, 2));

console.log("Mock DB generated successfully");
