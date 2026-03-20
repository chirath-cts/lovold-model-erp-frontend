import { withErrorHandling } from "../lib/http.js";

export function registerProductRoutes(app, { productService }) {
  app.get(
    "/products",
    withErrorHandling(async (req, res) => {
      const products = await productService.listProducts({
        categoryId: typeof req.query.categoryId === "string" ? req.query.categoryId : "",
        q: typeof req.query.q === "string" ? req.query.q : "",
        query: req.query,
      });
      res.json(products);
    }),
  );

  app.post(
    "/products",
    withErrorHandling(async (req, res) => {
      const product = await productService.createProduct(req.body ?? {});
      res.status(201).json(product);
    }),
  );

  app.patch(
    "/products/:id",
    withErrorHandling(async (req, res) => {
      res.json(await productService.updateProduct(req.params.id, req.body ?? {}));
    }),
  );
}
