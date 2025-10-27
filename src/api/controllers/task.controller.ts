import type { Context } from "hono";
import type { ITaskService } from "../../core/services/task.service.js";
import type { ContextJWT } from '../types/context-jwt.js'
import { eventBus } from '../../events/event-bus.js'

export class TaskController {
  constructor(private taskService: ITaskService) {}

  create = async (c: ContextJWT) => {
    const data = await c.req.json();
    const { id } = c.get('jwtPayload');
    
    const task = await this.taskService
    .create({ ...data, createdBy: id });

    return c.json({ task: task }, 201);
  };

  getById = async (c: Context) => {
    const id = c.req.param("id");
    const task = await this.taskService.getById(id);
    return c.json({ task });
  };

  getAll = async (c: Context) => {
    const params = c.req.query();
    const tasks = await this.taskService.getAll(params);
    return c.json({ tasks });
  };

  update = async (c: Context) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const task = await this.taskService.update(id, body);
    return c.json({ task });
  };

  delete = async (c: Context) => {
    const id = c.req.param("id");
    const deleted = await this.taskService.delete(id);
    return c.json({ task: deleted });
  };

  assignTaskToUser = async (c: Context) => {
    const { taskId, userId } 
    : { taskId: string, userId: string } 
    = await c.req.json();

    const taskAssignment = await this.taskService.assignTaskToUser(taskId, userId);
    eventBus.emit('task.assigned', { taskId, userId });
    return c.json({ taskAssignment });
  }

  unassignTaskFromUser = async (c: Context) => {
    const { id } = c.req.param();

    const taskAssignment = await this.taskService.unassignTaskFromUser(id);

    return c.json({ taskAssignment });
  }

  getAssignmentLengthByUserId = async (c: Context) => {
    const { id } = c.req.param();

    const rows = await this.taskService.getAssignmentLengthByUserId(id);

    return c.json({ rows });
  }
}
