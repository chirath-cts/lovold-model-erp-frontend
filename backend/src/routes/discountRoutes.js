import { withErrorHandling } from "../lib/http.js";

export function registerDiscountRoutes(app, { discountService }) {
  const collectionPaths = ["/customer-products", "/discounts"];

  collectionPaths.forEach((path) => {
    app.get(
      path,
      withErrorHandling(async (req, res) => {
        const customerProducts = await discountService.listCustomerProducts({
          customerId: typeof req.query.customerId === "string" ? req.query.customerId : "",
          status: typeof req.query.status === "string" ? req.query.status : "",
          query: req.query,
        });
        res.json(customerProducts);
      }),
    );

    app.post(
      path,
      withErrorHandling(async (req, res) => {
        const customerProduct = await discountService.createCustomerProduct(req.body ?? {});
        res.status(201).json(customerProduct);
      }),
    );

    app.patch(
      `${path}/:id`,
      withErrorHandling(async (req, res) => {
        res.json(
          await discountService.updateCustomerProduct(req.params.id, req.body ?? {}),
        );
      }),
    );
  });
}
