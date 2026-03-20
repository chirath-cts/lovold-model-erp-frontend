export class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

export const badRequestError = (message) => new AppError(400, message);
export const unauthorizedError = (message) => new AppError(401, message);
export const forbiddenError = (message) => new AppError(403, message);
export const notFoundError = (message) => new AppError(404, message);
