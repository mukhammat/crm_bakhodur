import type { CommandMiddleware } from "grammy";
import type { MyContext } from "../types/grammy.type.js";

export class AuthCommand {
    register: CommandMiddleware<MyContext> = async (ctx) => {
        await ctx.conversation.enter("register");
    }
}