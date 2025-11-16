import { InlineKeyboard, type Bot } from "grammy";
import { bootstrap } from "../../../bootstrap.js";
import type { MyBot } from "../types/grammy.type.js";

export function notificationEvents(
    bot: MyBot,
) {
    const taskService = bootstrap.core.services.taskService;
    const userService = bootstrap.core.services.userService;
    
    // Task assignment event handler
    bootstrap.eventBus.on('task:assigned', async (data) => {
      try {
        const { taskId, userId } = data;
        console.log('Assigning task:', data);
      
        const task = await taskService.getById(taskId);
    
        if(task?.statusId !== 1) {
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
        .text('Start', `take:${task.id}`)

        await bot.api.sendMessage(user.telegramId, `✅ You have a new task: ${task?.title}\n${task?.description}`, {
          reply_markup: inline
        });
    
        console.log('Task assigned:', data);
        
      } catch (error) {
        console.error('Error assigning task:', error);
      }
    });

    // Task reminder event handler
    bootstrap.eventBus.on('task.remember', async (data) => {
      try {
        const { taskId, userId } = data;
        console.log('Task reminder:', data);
      
        const user = await userService.getById(userId);

        if(!user) {
          console.log('No user found for userId:', userId);
          return;
        }
    
        if(!user?.telegramId) {
          console.log('User does not have a telegramId, skipping reminder.');
          return;
        }

        const task = await taskService.getById(taskId);

        if(!task) {
          console.log('Task not found:', taskId);
          return;
        }

        // Check that task is not yet completed
        if(task.statusId === 3) {
          console.log('Task is completed, skipping reminder.');
          return;
        }

        const inline = new InlineKeyboard();
        
        if(task.statusId === 1) {
          inline.text('Start', `take:${task.id}`);
        } else if(task.statusId === 2) {
          inline.text('Complete', `complete:${task.id}`);
        }

        const message = `🔔 Task reminder!\n\n` +
          `📋 ${task.title}\n` +
          `${task.description}\n\n` +
          `⏰ Due date: ${task.dueDate}`;

        await bot.api.sendMessage(user.telegramId, message, {
          reply_markup: inline
        });
    
        console.log('Task reminder sent:', data);
        
      } catch (error) {
        console.error('Error sending task reminder:', error);
      }
    });
}