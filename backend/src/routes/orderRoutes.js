import { withErrorHandling } from "../lib/http.js";

export function registerOrderRoutes(app, { orderService }) {
  app.get(
    "/orders",
    withErrorHandling(async (req, res) => {
      const orders = await orderService.listOrders({
        customerId: typeof req.query.customerId === "string" ? req.query.customerId : "",
        status: typeof req.query.status === "string" ? req.query.status : "",
        query: req.query,
      });
      res.json(orders);
    }),
  );

  app.post(
    "/orders",
    withErrorHandling(async (req, res) => {
      const order = await orderService.createOrder(req.body ?? {});
      res.status(201).json(order);
    }),
  );

  app.patch(
    "/orders/:id",
    withErrorHandling(async (req, res) => {
      res.json(await orderService.updateOrder(req.params.id, req.body ?? {}));
    }),
  );

  app.delete(
    "/orders/:id",
    withErrorHandling(async (req, res) => {
      await orderService.deleteOrder(req.params.id);
      res.status(204).end();
    }),
  );
}
