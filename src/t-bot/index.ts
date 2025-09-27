import { Bot, InlineKeyboard } from "grammy";
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

    if(task?.status !== 'pending') {
      console.log('Task is not pending, skipping notification.');
      return;
    }

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

    const inline = new InlineKeyboard()
    .text('Приступить', `take`)

    await bot.api.sendMessage(worker.telegramId, `Новая задача: ${task?.title}\n${task?.description}`, {
      reply_markup: inline
    });

    console.log('Task assigned:', data);
    
  } catch (error) {
    console.error('Error assigning task:', error);
  }
});

bot.callbackQuery('take', async (ctx) => {
  await db.update(tasks).set({
    'status': 'in_progress',
  })
  await ctx.answerCallbackQuery('Вы приступили к задаче!');
});

// Start the bot.
bot.start();