import { InlineKeyboard, type Bot } from "grammy";
import { eventBus } from "../../event-bus.js";
import { TaskService } from "../../core/services/task.service.js";
import { UserService } from "../../core/services/user.service.js";
import db from "../../database/index.js";
import type { MyBot } from "../types/grammy.type.js";

export function notificationEvents(
    bot: MyBot,
) {
    const taskService = new TaskService(db)
    const userService = new UserService(db)
    
    eventBus.on('task.assigned', async (data) => {
      try {
        const { taskId, userId } = data;
        console.log('Assigning task:', data);
      
        const task = await taskService.getById(taskId);
    
        if(task?.status !== 'pending') {
          console.log('Task is not pending, skipping notification.');
          return;
        }

        const user = await userService.getById(userId);

        if(!user) {
          console.log('No user found for userId:', userId);
          return;
        }
    
        if(!user?.telegramId) {
          console.log('User does not have a telegramId, skipping notification.');
          return;
        }

        console.log('Found user:', user);
    
        const inline = new InlineKeyboard()
        .text('Приступить', `take:${task.id}`)

        await bot.api.sendMessage(user.telegramId, `✅ У вас новая задача: ${task?.title}\n${task?.description}`, {
          reply_markup: inline
        });
    
        console.log('Task assigned:', data);
        
      } catch (error) {
        console.error('Error assigning task:', error);
      }
    });
}