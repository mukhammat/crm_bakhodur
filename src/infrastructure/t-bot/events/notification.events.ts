import { InlineKeyboard, type Bot } from "grammy";
import { eventBus } from "../../../events/event-bus.js";
import { bootstrap } from "../../../bootstrap.js";
import type { MyBot } from "../types/grammy.type.js";

export function notificationEvents(
    bot: MyBot,
) {
    const taskService = bootstrap.core.services.taskService;
    const userService = bootstrap.core.services.userService;
    
    // Обработчик события назначения задачи
    eventBus.on('task.assigned', async (data) => {
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
        .text('Приступить', `take:${task.id}`)

        await bot.api.sendMessage(user.telegramId, `✅ У вас новая задача: ${task?.title}\n${task?.description}`, {
          reply_markup: inline
        });
    
        console.log('Task assigned:', data);
        
      } catch (error) {
        console.error('Error assigning task:', error);
      }
    });

    // Обработчик события напоминания о задаче
    eventBus.on('task.remember', async (data) => {
      try {
        const { taskId, userId, taskTitle, taskDescription, dueDate } = data;
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

        // Форматируем дату срока выполнения
        const dueDateFormatted = dueDate 
          ? new Date(dueDate).toLocaleString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'не указан';

        const task = await taskService.getById(taskId);

        if(!task) {
          console.log('Task not found:', taskId);
          return;
        }

        // Проверяем, что задача еще не выполнена
        if(task.statusId === 3) {
          console.log('Task is completed, skipping reminder.');
          return;
        }

        const inline = new InlineKeyboard();
        
        if(task.statusId === 1) {
          inline.text('Приступить', `take:${task.id}`);
        } else if(task.statusId === 2) {
          inline.text('Закончить', `complete:${task.id}`);
        }

        const message = `🔔 Напоминание о задаче!\n\n` +
          `📋 ${taskTitle}\n` +
          `${taskDescription}\n\n` +
          `⏰ Срок выполнения: ${dueDateFormatted}`;

        await bot.api.sendMessage(user.telegramId, message, {
          reply_markup: inline
        });
    
        console.log('Task reminder sent:', data);
        
      } catch (error) {
        console.error('Error sending task reminder:', error);
      }
    });
}