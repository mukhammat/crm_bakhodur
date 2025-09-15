import { DrizzleQueryError } from "drizzle-orm/errors";
import {} from "hono";
import { CustomError } from "../errors/custom.error.js";
export const errorHandler = (err, c) => {
    let message = 'Internal Server Error';
    console.error(err);
    if (err instanceof CustomError) {
        message = err.message;
        console.log(message);
    }
    return c.json({
        message,
    }, 500);
};
