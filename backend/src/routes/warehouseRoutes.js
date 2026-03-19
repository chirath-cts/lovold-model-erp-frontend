import { withErrorHandling } from "../lib/http.js";

export function registerWarehouseRoutes(app, { warehouseService }) {
  app.get(
    "/warehouses",
    withErrorHandling(async (_req, res) => {
      res.json(await warehouseService.listWarehouses());
    }),
  );
}
