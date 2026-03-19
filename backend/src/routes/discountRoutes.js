import { withErrorHandling } from "../lib/http.js";

export function registerDiscountRoutes(app, { discountService }) {
  app.get(
    "/discounts",
    withErrorHandling(async (req, res) => {
      const discounts = await discountService.listDiscounts({
        customerId: typeof req.query.customerId === "string" ? req.query.customerId : "",
        status: typeof req.query.status === "string" ? req.query.status : "",
        query: req.query,
      });
      res.json(discounts);
    }),
  );

  app.post(
    "/discounts",
    withErrorHandling(async (req, res) => {
      const discount = await discountService.createDiscount(req.body ?? {});
      res.status(201).json(discount);
    }),
  );

  app.patch(
    "/discounts/:id",
    withErrorHandling(async (req, res) => {
      res.json(await discountService.updateDiscount(req.params.id, req.body ?? {}));
    }),
  );
}
