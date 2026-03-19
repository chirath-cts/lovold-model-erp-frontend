import { withErrorHandling } from "../lib/http.js";

export function registerHealthRoutes(app, { healthService }) {
  app.get(
    "/health",
    withErrorHandling(async (_req, res) => {
      res.json(await healthService.getHealth());
    }),
  );
}
