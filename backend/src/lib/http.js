import { AppError } from "./appError.js";

export const withErrorHandling = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).send(error.message);
      return;
    }

    console.error(error);
    res.status(500).send(error instanceof Error ? error.message : "Internal server error");
  }
};
