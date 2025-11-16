import type { ContentfulStatusCode } from "hono/utils/http-status";

export class CustomError extends Error {
  public statusCode: ContentfulStatusCode | number | unknown;

  constructor(message = "Request error", statusCode: ContentfulStatusCode | number | unknown = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;

    // Create error stack
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const customError = new CustomError();