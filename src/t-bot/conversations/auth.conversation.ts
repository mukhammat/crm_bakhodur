import type { Conversation } from "../types/grammy.type.js";
import db, { users } from "../../database/index.js";
import type { Context } from "grammy";
import { redis } from '../../cache/redis.js'

export class AuthConversation {
    public register = async (conversation: Conversation, ctx: Context) => {
        await ctx.reply("Введите ключ регистрации:");
    
        const { message } = await conversation.wait();
        const key = message?.text?.trim();
    
        if (!key) {
            await ctx.reply("Нужен текстовый ключ. Попробуйте снова: /register");
            return;
        }
    
        const role = await redis.get(`register_key:${key}`);
    
        if (role !== 'worker') {
            await ctx.reply("Неверный ключ!");
            return;
        }
    
        const name = ctx.from?.first_name || ctx.from?.username || "Неизвестный пользователь";
    
        await db.insert(users).values({
            email: ctx.chat?.id.toString() || "",
            hash: "0",
            name,
            role: role,
            telegramId: ctx.chatId || 0
        }).returning({
            id: users.id,
        });
        
        await ctx.reply("Вы успешно зарегистрированы ✅");
    }
}