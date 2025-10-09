import { HttpError, GrammyError } from "grammy";
import { CustomError } from "../../core/errors/custom.error.js";
export const errorHandlerMiddleware = async (err) => {
    const ctx = err.ctx;
    const e = err.error;
    if (e instanceof GrammyError) {
        console.error("Error in request:", e.description);
    }
    else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
    }
    else {
        console.error("Unknown error:", e);
    }
    // Отправляем сообщение пользователю
    try {
        // Если это callback, сначала отвечаем на него, 
        // иначе сообщение «зависнет»
        if (ctx.callbackQuery) {
            await ctx.answerCallbackQuery({ text: "Произошла ошибка, попробуйте снова", show_alert: false });
        }
        if (e instanceof CustomError) {
            await ctx.reply(e.message);
            return;
        }
        // Отправляем текстовую ошибку
        await ctx.reply("😔 Упс! Что‑то пошло не так. Попробуйте повторить действие или обратитесь к администратору.");
    }
    catch (sendErr) {
        console.error("Ошибка отправки ошибки пользователью:", sendErr);
    }
};
