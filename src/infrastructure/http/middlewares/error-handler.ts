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
    
    // В продакшене показываем общее сообщение
    if (process.env.NODE_ENV === 'production') {
      message = 'Произошла внутренняя ошибка сервера';
    }
  }
  
  return c.json({
    message,
  }, status || 500);
}