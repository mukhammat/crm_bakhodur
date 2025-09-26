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

import { eventBus } from '../event-bus.js'
import db, { tasks, workers } from "../database/index.js";
import { eq } from "drizzle-orm";

eventBus.on('task.assigned', async (data) => {
  try {
    const { taskId, userId } = data;
    console.log('Assigning task:', data);
  
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });
  
    const worker = await db.query.workers.findFirst({
      where: eq(workers.userId, userId),
      columns: {
        telegramId: true,
      }
    });

    if(!worker?.telegramId) {
      console.log('User does not have a telegramId, skipping notification.');
      return;
    }

    console.log('Found user:', worker);

    await bot.api.sendMessage(worker.telegramId, `A new task has been assigned to you: ${task?.title}`);

    console.log('Task assigned:', data);
    
  } catch (error) {
    console.error('Error assigning task:', error);
  }
});

bot.on("message", (ctx) => ctx.reply("Got another message!"));

// Start the bot.
bot.start();