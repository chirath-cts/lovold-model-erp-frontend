import { withErrorHandling } from "../lib/http.js";

export function registerCustomersRoutes(app, { customerService }) {
  app.get(
    "/customers",
    withErrorHandling(async (req, res) => {
      res.json(await customerService.listCustomers(req.query));
    }),
  );

  app.get(
    "/customers/:id",
    withErrorHandling(async (req, res) => {
      res.json(await customerService.getCustomerById(req.params.id));
    }),
  );
}
