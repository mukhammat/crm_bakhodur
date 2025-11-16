import type { ErrorHandler } from "grammy";
import type { MyContext } from "../types/grammy.type.js";
import { HttpError, GrammyError }from "grammy";
import { CustomError } from "../../../core/errors/custom.error.js"
import { logToFile } from '../../../utils/log-to-file.util.js'

export const errorHandlerMiddleware: ErrorHandler<MyContext> =  async (err) => {
  const ctx = err.ctx;
  const e = err.error;

  logToFile(`Telegram Bot Error - \n${err}`)

  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }

  // Send message to user
  try {
    // If this is a callback, answer it first, 
    // otherwise the message will "hang"
    if (ctx.callbackQuery) {
      await ctx.answerCallbackQuery({ text: "An error occurred, please try again", show_alert: false });
    }

    if(e instanceof CustomError) {
      await ctx.reply(e.message);
      return;
    }

    // Send error message
    await ctx.reply("😔 Oops! Something went wrong. Please try again or contact the administrator.");
  } catch (sendErr) {
    console.error("Error sending error message to user:", sendErr);
  }
};