import cron from 'cron'
import { bootstrap } from '../bootstrap.js'
import { eventBus } from '../events/event-bus.js'

/**
 * Напоминания о задачах с dueDate
 * Запускается в 9:00, 11:00, 16:00, 19:00 каждый день
 */
const sendTaskReminders = async () => {
  try {
    const taskService = bootstrap.core.services.taskService;

    // Получаем все задачи с dueDate для напоминаний через сервис
    const tasksWithDueDate = await taskService.getTasksForReminders();

    console.log(`[Cron] Найдено задач для напоминаний: ${tasksWithDueDate.length}`);

    // Для каждой задачи отправляем напоминание назначенным пользователям
    for (const task of tasksWithDueDate) {
      if (!task.assignments || task.assignments.length === 0) {
        continue;
      }

      for (const assignment of task.assignments) {
        if (!assignment.user?.telegramId) {
          continue;
        }

        // Отправляем событие напоминания
        eventBus.emit('task.remember', {
          taskId: task.id,
          userId: assignment.user.id,
          taskTitle: task.title,
          taskDescription: task.description,
          dueDate: task.dueDate,
        });

        console.log(`[Cron] Отправлено напоминание для задачи ${task.id} пользователю ${assignment.user.id}`);
      }
    }
  } catch (error) {
    console.error('[Cron] Ошибка при отправке напоминаний:', error);
  }
};

// Создаем cron задачи для каждого времени: 9:00, 11:00, 16:00, 19:00
const reminderTimes = [
  '0 9 * * *',  // 9:00 каждый день
  '0 11 * * *', // 11:00 каждый день
  '0 16 * * *', // 16:00 каждый день
  '0 19 * * *', // 19:00 каждый день
];

// Создаем и запускаем cron задачи
const jobs = reminderTimes.map((cronTime, index) => {
  // start: true - запускает задачу автоматически при создании
  const job = new cron.CronJob(cronTime, sendTaskReminders, null, true, 'Asia/Dubai');
  console.log(`[Cron] Запущено напоминание #${index + 1} по расписанию: ${cronTime} (часовой пояс: Asia/Dubai)`);
  return job;
});

// Экспортируем для возможности остановки при необходимости
export { sendTaskReminders, jobs };