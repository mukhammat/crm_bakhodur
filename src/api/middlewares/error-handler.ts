import { type ErrorHandler } from "hono";
import { CustomError } from "../../core/errors/custom.error.js";

export const errorHandler: ErrorHandler = (err, c) => {
  let message = 'Internal Server Error';
  let status = 500;

  if (err instanceof CustomError) {
    message = err.message;

    if(err.statusCode) status = err.statusCode as number;
  }
  
  return c.json({
    message,
    // @ts-ignore
  }, status);
}