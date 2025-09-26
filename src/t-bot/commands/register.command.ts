import type { CommandMiddleware } from "grammy";
import type { MyContext } from "../types/grammy.type.js";

export const registerCommand: CommandMiddleware<MyContext> = async (ctx) => {
    await ctx.conversation.enter("registerConversation");
}