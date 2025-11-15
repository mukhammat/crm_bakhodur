import cron from 'cron'
import { bootstrap } from '../../bootstrap.js'

const eventBus = bootstrap.eventBus;

/**
 * Remember tasks with dueDate
 * It runs at 9:00, 11:00, 16:00, 19:00 every day by OAE timestamp
 */
const sendTaskReminders = async () => {
  try {
    const taskService = bootstrap.core.services.taskService;

    const tasksWithDueDate = await taskService.getTasksForReminders();

    console.log(`[Cron] Tasks for remembing: ${tasksWithDueDate.length}`);

    for (const task of tasksWithDueDate) {
      if (!task.assignments || task.assignments.length === 0) {
        continue;
      }

      for (const assignment of task.assignments) {
        if (!assignment.user?.telegramId) {
          continue;
        }

        eventBus.emit('task.remember', {
          taskId: task.id,
          userId: assignment.user.id,
        });

        console.log(`[Cron] Send rememb for Task with ID ${task.id} and user with ID ${assignment.user.id}`);
      }
    }
  } catch (error) {
    console.error('[Cron] Rememb send error:', error);
  }
};

const reminderTimes = [
  '0 9 * * *',
  '0 11 * * *',
  '0 16 * * *',
  '0 19 * * *',
];

const jobs = reminderTimes.map((cronTime, index) => {
  const job = new cron.CronJob(cronTime, sendTaskReminders, null, true, 'Asia/Dubai');
  console.log(`[Cron] Remember is runned #${index + 1} : ${cronTime} (Asia/Dubai)`);
  return job;
});


export { sendTaskReminders, jobs };