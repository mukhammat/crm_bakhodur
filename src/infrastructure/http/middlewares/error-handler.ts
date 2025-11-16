import { type ErrorHandler } from "hono";
import { CustomError } from "../../../core/errors/custom.error.js";
import { logToFile } from '../../../utils/log-to-file.util.js'

export const errorHandler: ErrorHandler = (err, c) => {
  let message = 'Internal Server Error';
  let status;

  logToFile(`${err}`, 'error.log')

  if (err instanceof CustomError) {
    message = err.message;
    if(err.statusCode) status = err.statusCode;
  } else {
    console.error('Internal server error:', {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      url: c.req.url,
      method: c.req.method,
    });
    
    // In production show generic message
    if (process.env.NODE_ENV === 'production') {
      message = 'Internal server error occurred';
    }
  }
  
  return c.json({
    message,
  }, status || 500);
}