import { withErrorHandling } from "../lib/http.js";

export function registerOrderItemRoutes(app, { orderItemService }) {
  app.get(
    "/orderItems",
    withErrorHandling(async (req, res) => {
      const orderItems = await orderItemService.listOrderItems({
        orderId: typeof req.query.orderId === "string" ? req.query.orderId : "",
        query: req.query,
      });
      res.json(orderItems);
    }),
  );

  app.post(
    "/orderItems",
    withErrorHandling(async (req, res) => {
      const orderItem = await orderItemService.createOrderItem(req.body ?? {});
      res.status(201).json(orderItem);
    }),
  );

  app.delete(
    "/orderItems/:id",
    withErrorHandling(async (req, res) => {
      await orderItemService.deleteOrderItem(req.params.id);
      res.status(204).end();
    }),
  );
}
