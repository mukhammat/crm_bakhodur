import { createMiddleware } from 'hono/factory';
import { jwt } from 'hono/jwt';
export const requireAuth = createMiddleware(async (c, next) => {
    return jwt({
        secret: process.env.SECRET_KEY || "",
    })(c, next);
});
