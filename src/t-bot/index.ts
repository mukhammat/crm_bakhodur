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
import { AuthController } from './controllers/auth.controller.js'
const authController = new AuthController()

bot.use(createConversation(authController.registerConversation));

// Commands
import db from "../database/index.js";
import { TaskService }  from '../core/services/task.service.js'
import { UserService }  from '../core/services/user.service.js'
import { TaskController } from './controllers/task.controller.js'
import { startCommand } from './commands/start.command.js'
import { requireAuthMiddleware } from "./middlewares/require-auth.middleware.js";

const taskService = new TaskService(db);
const userService =  new UserService(db);
const taskController = new TaskController(taskService, userService)

bot.command('register', registerCommand)
bot.use(requireAuthMiddleware)
bot.command('start', startCommand)
bot.command('mytasks', taskController.myTasks)

import { notificationEvents } from './events/notification.events.js'


notificationEvents(bot)

// Start the bot.
bot.start();