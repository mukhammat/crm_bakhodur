import type { Context } from "hono";
import type { ITaskService } from "./task.service.js";
import type { ContextJWT } from '../../types/context-jwt.js'
import { eventBus } from '../../../event-bus.js'

export class TaskController {
  constructor(private taskService: ITaskService) {}

  create = async (c: ContextJWT) => {
    const { title, description } = await c.req.json();
    const { id } = c.get('jwtPayload');
    const taskId = await this.taskService
    .create({ title, description, createdBy: id });
    
    return c.json({ data: { id: taskId } }, 201);
  };

  getById = async (c: Context) => {
    const id = c.req.param("id");
    const task = await this.taskService.getById(id);
    return c.json({ data: { task } });
  };

  getAll = async (c: Context) => {
    const params = c.req.query();
    const tasks = await this.taskService.getAll(params);
    return c.json({ data: { tasks } });
  };

  update = async (c: Context) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const updatedId = await this.taskService.update(id, body);
    return c.json({ data: { id: updatedId } });
  };

  delete = async (c: Context) => {
    const id = c.req.param("id");
    const deletedId = await this.taskService.delete(id);
    return c.json({ id: deletedId });
  };

  assignTaskToWorker = async (c: Context) => {
    const { taskId, userId } 
    : { taskId: string, userId: string } 
    = await c.req.json();

    const taskAssignmentId = await this.taskService.assignTaskToWorker(taskId, userId);
    eventBus.emit('task.assigned', { taskId, userId });
    return c.json({ data: { taskAssignmentId }});
  }

  unassignTaskFromWorker = async (c: Context) => {
    const { id } = c.req.param();

    const deletedTaskAssignmentId = 
    await this.taskService.unassignTaskFromWorker(id);

    return c.json({ data: { deletedTaskAssignmentId }});
  }
}
