import type { Middleware } from "grammy";
import type { MyContext } from "../types/grammy.type.js";
import db, { workers } from "../../database/index.js";
import { eq } from "drizzle-orm";

export const requireAuthMiddleware: Middleware<MyContext> = async (ctx, next) => {
    const worker = await db.
    query
    .workers
    .findFirst({
        where: eq(workers.telegramId, ctx.chatId || 0)
    })

    if(!worker) {
        await ctx.reply('Доступ запрещен! Если есть ключ вы можете зарегистрироватся нажав на команду /register')
        return;
    }

    await next()
}