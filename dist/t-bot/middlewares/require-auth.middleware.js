import db, { users } from "../../database/index.js";
import { eq } from "drizzle-orm";
export const requireAuthMiddleware = async (ctx, next) => {
    const user = await db.
        query
        .users
        .findFirst({
        where: eq(users.telegramId, ctx.chatId || 0),
        columns: {
            id: true
        }
    });
    if (!user) {
        await ctx.reply('Доступ запрещен! Если есть ключ вы можете зарегистрироватся нажав на команду /register');
        return;
    }
    ctx.user = user;
    await next();
};
