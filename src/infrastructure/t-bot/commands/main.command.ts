import type { CommandMiddleware, Context } from "grammy";

export class MainCommand {
    start: CommandMiddleware<Context> = (ctx) => {
        ctx.reply('Компания ттт!')
    }
}