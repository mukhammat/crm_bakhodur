import type { Context } from "hono";
import type { ITaskService } from "../../core/services/task.service.js";
import type { ContextJWT } from '../types/context-jwt.js'
import { eventBus } from '../../events/event-bus.js'

export class TaskController {
  constructor(private taskService: ITaskService) {}

  create = async (c: ContextJWT) => {
    const data = await c.req.json();
    const { id } = c.get('jwtPayload');
    
    // Convert dueDate string to Date object if provided
    const processedData = {
      ...data,
      createdBy: id,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    };
    
    const task = await this.taskService.create(processedData);

    return c.json({ task }, 201);
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
    
    // Convert dueDate string to Date object if provided
    const processedData: any = { ...body };
    if (body.dueDate !== undefined) {
      processedData.dueDate = body.dueDate !== null ? new Date(body.dueDate) : null;
    }
    
    const task = await this.taskService.update(id, processedData);
    return c.json({ task });
  };

  delete = async (c: Context) => {
    const id = c.req.param("id");
    const deleted = await this.taskService.delete(id);
    return c.json({ task: deleted });
  };
}
