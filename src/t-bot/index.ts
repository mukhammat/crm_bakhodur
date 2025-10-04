import { Bot } from "grammy";
import {
  conversations,
  createConversation
} from "@grammyjs/conversations";
import type { MyBot } from "./types/grammy.type.js";
import { notificationEvents } from './events/notification.events.js'
import _ from './bootstrap.js'
import { requireAuthMiddleware } from "./middlewares/require-auth.middleware.js";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

const bot: MyBot = new Bot(TOKEN)
bot.use(conversations())

// Concertaions
bot.use(createConversation(_.conversation.authConversation.register));

// Commands
bot.command('register', _.command.authCommand.register);
bot.use(requireAuthMiddleware)
bot.command('start', _.command.mainCommand.start)
bot.command('mytasks', _.command.taskCommand.myTasks)
bot.command('completedtasks', _.command.taskCommand.getCompletedTasks)
bot.command('inprogresstasks', _.command.taskCommand.getInPorgressTasks)
bot.command('pendingtasks', _.command.taskCommand.getPendingTasks)

// Callbacks
bot.callbackQuery(/^take/, _.callback.taskCallback.take)
bot.callbackQuery(/^complete/, _.callback.taskCallback.complete)

notificationEvents(bot)

// Start the bot.
bot.start();