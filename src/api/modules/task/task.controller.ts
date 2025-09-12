import { type JwtVariables } from 'hono/jwt'
import type { Context } from "hono";
import type { ITaskService } from "./task.interface.js";

type ContextJWT = Context<{ Variables: JwtVariables<{ id: string }> }>;

export class TaskController {
  constructor(private taskService: ITaskService) {}

  create = async (c: ContextJWT) => {
    const { description } = await c.req.json();
    const { id } = c.get('jwtPayload');
    const taskId = await this.taskService.create(description, id);
    return c.json({ data: { id: taskId } }, 201);
  };

  getById = async (c: Context) => {
    const id = c.req.param("id");
    const task = await this.taskService.getById(id);
    return c.json({ data: { task } });
  };

  getAll = async (c: Context) => {
    const createdBy = c.req.query("createdBy");
    const tasks = await this.taskService.getAll(createdBy || undefined);
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
    const { taskId, workerId } 
    : { taskId: string, workerId: string } 
    = await c.req.json();

    const taskAssignmentId = await this.taskService.assignTaskToWorker(taskId, workerId);

    return c.json({ data: { taskAssignmentId }});
  }

  unassignTaskFromWorker = async (c: Context) => {
    const { id } = c.req.param();

    const deletedTaskAssignmentId = 
    await this.taskService.unassignTaskFromWorker(id);

    return c.json({ data: { deletedTaskAssignmentId }});
  }
}
