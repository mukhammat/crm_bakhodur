import type { Middleware } from "grammy";
import type { MyContext } from "../types/grammy.type.js";
import { bootstrap } from '../../../bootstrap.js'

export const requireAuthMiddleware: Middleware<MyContext> = async (ctx, next) => {
    const user = await bootstrap.core.services.userService.getByTelegramId(ctx.chatId || 0)

    if(!user) {
        await ctx.reply('Доступ запрещен! Если есть ключ вы можете зарегистрироватся нажав на команду /register')
        return;
    }

    ctx.user = user

    await next()
}