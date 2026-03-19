import { registerAuthRoutes } from "../routes/authRoutes.js";
import { registerCategoriesRoutes } from "../routes/categoryRoutes.js";
import { registerCustomersRoutes } from "../routes/customerRoutes.js";
import { registerDiscountRoutes } from "../routes/discountRoutes.js";
import { registerHealthRoutes } from "../routes/healthRoutes.js";
import { registerOrderItemRoutes } from "../routes/orderItemRoutes.js";
import { registerOrderRoutes } from "../routes/orderRoutes.js";
import { registerProductRoutes } from "../routes/productRoutes.js";
import { registerSupplierRoutes } from "../routes/supplierRoutes.js";
import { registerUserRoutes } from "../routes/userRoutes.js";
import { registerWarehouseProductRoutes } from "../routes/warehouseProductRoutes.js";
import { registerWarehouseRoutes } from "../routes/warehouseRoutes.js";

export function registerRoutes(app, services) {
  registerHealthRoutes(app, services);
  registerCategoriesRoutes(app, services);
  registerProductRoutes(app, services);
  registerCustomersRoutes(app, services);
  registerOrderRoutes(app, services);
  registerOrderItemRoutes(app, services);
  registerDiscountRoutes(app, services);
  registerUserRoutes(app, services);
  registerAuthRoutes(app, services);
  registerSupplierRoutes(app, services);
  registerWarehouseRoutes(app, services);
  registerWarehouseProductRoutes(app, services);
}
