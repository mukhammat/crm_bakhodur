import type { Conversation } from "../types/grammy.type.js";
import db, { users, workers } from "../../database/index.js";
import type { Context } from "grammy";
import { redis } from '../../cache/redis.js'

export async function registerConversation(conversation: Conversation, ctx: Context) {
    await ctx.reply("Введите ключ регистрации:");

    // ждём ответа пользователя
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

    const [user] = await db.insert(users).values({
        email: ctx.chat?.id.toString() || "",
        hash: "0",
        name,
        role: role,
    }).returning({
        id: users.id,
    });

    await db.insert(workers).values({
        userId: user.id,
        telegramId: ctx.chatId || 0
    });

    await ctx.reply("Вы успешно зарегистрированы ✅");
}
