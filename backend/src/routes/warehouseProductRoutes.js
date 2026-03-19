import { withErrorHandling } from "../lib/http.js";

export function registerWarehouseProductRoutes(app, { warehouseProductService }) {
  app.get(
    "/warehouseProducts",
    withErrorHandling(async (req, res) => {
      const warehouseProducts = await warehouseProductService.listWarehouseProducts({
        productId: typeof req.query.productId === "string" ? req.query.productId : "",
        warehouseId:
          typeof req.query.warehouseId === "string" ? req.query.warehouseId : "",
      });
      res.json(warehouseProducts);
    }),
  );
}
