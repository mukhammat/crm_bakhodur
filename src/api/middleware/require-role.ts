import { createMiddleware } from 'hono/factory'
import { type InferResultType } from "../../database/index.js";

export type TokenData = {
    id: string;
    telegramId: string;
    role: InferResultType<'users'>['role'];
};

type Role = Omit<InferResultType<"users">, "hash">["role"];

export const requireRole = (roles: Role[]) => {
  return  createMiddleware(async (c, next) => {
    const user: TokenData = c.get("jwtPayload");
    const a = roles.find((role)=> role === user.role);
    if(!user || !user.role || !a) {
      return c.json({message: 'Нет доступа!'}, 403);
    }
    await next()
  })
}