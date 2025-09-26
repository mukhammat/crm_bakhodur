import { Bot } from "grammy";
import {
  conversations,
  createConversation
} from "@grammyjs/conversations";
import { registerCommand } from './commands/register.command.js'
import type { MyBot } from "./types/grammy.type.js";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

const bot: MyBot = new Bot(TOKEN)
bot.use(conversations())

// Concertaions
import { registerConversation } from "./conversations/register.conversation.js";
bot.use(createConversation(registerConversation));

// Commands
import { startCommand } from './commands/start.command.js'
import { requireAuthMiddleware } from "./middlewares/require-auth.middleware.js";

bot.command('register', registerCommand)
bot.use(requireAuthMiddleware)
bot.command('start', startCommand)



bot.on("message", (ctx) => ctx.reply("Got another message!"));

// Start the bot.
bot.start();