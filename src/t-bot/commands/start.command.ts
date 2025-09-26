import type { CommandMiddleware, Context } from "grammy";

export const startCommand: CommandMiddleware<Context> = (ctx) => {
    ctx.reply('Компания ттт!')
}