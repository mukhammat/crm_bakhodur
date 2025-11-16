import { bootstrap } from '../../bootstrap.js'
import { firebaseMessaging } from './init.js'

bootstrap.eventBus.on('task:assigned', async (data) => {
  try {
    const { taskId, userId } = data;
    console.log('Assigning task:', data);
  
    const task = await bootstrap.core.services.taskService.getById(taskId);

    if(task?.statusId !== 1) {
      console.log('Task is not pending, skipping notification.');
      return;
    }

    const user = await bootstrap.core.services.userService.getById(userId);

    if(!user) {
      console.log('No user found for userId:', userId);
      return;
    }

    console.log('Found user:', user);

    if(!user.fcmToken) {
      console.log('User has not fcmToken!');
      return;
    }

    const message = {
      token: user.fcmToken,
      notification: {
        title: 'New Task Assigned',
        body: `You have been assigned a new task: ${task.title}`
      },
      data: {
        type: 'task_assigned',
        taskId: task.id,
        userId: userId
      }
    }

    await firebaseMessaging.send(message)

    console.log('Task assigned:', data);
    
  } catch (error) {
    console.error('Error assigning task:', error);
  }
});

// Remember task event
bootstrap.eventBus.on('task.remember', async (data) => {
  try {
    const { taskId, userId } = data;
    console.log('Task reminder:', data);
  
    const user = await bootstrap.core.services.userService.getById(userId);

    if(!user) {
      console.log('No user found for userId:', userId);
      return;
    }

    const task = await bootstrap.core.services.taskService.getById(taskId);

    if(!task) {
      console.log('Task not found:', taskId);
      return;
    }

    // Check that task is not yet completed
    if(task.statusId === 3) {
      console.log('Task is completed, skipping reminder.');
      return;
    }

    if(!user.fcmToken) {
      console.log('User has not fcmToken!');
      return;
    }

    const message = {
      token: user.fcmToken,
      notification: {
        title: 'Task Reminder',
        body: `Reminder: ${task.title} - Due date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}`
      },
      data: {
        type: 'task_reminder',
        taskId: task.id,
        userId: userId
      }
    }

    await firebaseMessaging.send(message)

    console.log('Task reminder sent:', data);
    
  } catch (error) {
    console.error('Error sending task reminder:', error);
  }
});
