import { withErrorHandling } from "../lib/http.js";

export function registerUserRoutes(app, { userService }) {
  app.get(
    "/users",
    withErrorHandling(async (req, res) => {
      res.json(await userService.listUsers(req.query));
    }),
  );
}
