export class ApiError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export const normalizeError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  return new Error("Unexpected error");
};
