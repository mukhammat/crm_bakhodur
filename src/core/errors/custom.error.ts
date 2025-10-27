import type { ContentfulStatusCode } from "hono/utils/http-status";

export class CustomError extends Error {
  public statusCode: ContentfulStatusCode | number | unknown;

  constructor(message = "Ошибка запроса", statusCode: ContentfulStatusCode | number | unknown = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;

    // Создание стека ошибок
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const customError = new CustomError();