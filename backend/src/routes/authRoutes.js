import { withErrorHandling } from "../lib/http.js";

export function registerAuthRoutes(app, { authService }) {
  app.post(
    "/auth/login",
    withErrorHandling(async (req, res) => {
      res.json(await authService.login(req.body ?? {}));
    }),
  );
}
