import { createMiddleware } from 'hono/factory';
import {} from "../../database/index.js";
export const requireRole = (roles) => {
    return createMiddleware(async (c, next) => {
        const user = c.get("jwtPayload");
        const a = roles.find((role) => role === user.role);
        if (!user || !user.role || !a) {
            return c.json({ message: 'Нет доступа!' }, 403);
        }
        await next();
    });
};
