import { withErrorHandling } from "../lib/http.js";

export function registerCategoriesRoutes(app, { categoryService }) {
  app.get(
    "/categories",
    withErrorHandling(async (_req, res) => {
      res.json(await categoryService.listCategories());
    }),
  );

  app.get(
    "/productCategories",
    withErrorHandling(async (_req, res) => {
      res.json(await categoryService.listCategories());
    }),
  );

  app.post(
    "/categories",
    withErrorHandling(async (req, res) => {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json(category);
    }),
  );
}
