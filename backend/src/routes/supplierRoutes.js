import { withErrorHandling } from "../lib/http.js";

export function registerSupplierRoutes(app, { supplierService }) {
  app.get(
    "/suppliers",
    withErrorHandling(async (_req, res) => {
      res.json(await supplierService.listSuppliers());
    }),
  );
}
