import {} from 'hono/jwt';
export class TaskController {
    taskService;
    constructor(taskService) {
        this.taskService = taskService;
    }
    create = async (c) => {
        const { title, description } = await c.req.json();
        const { id } = c.get('jwtPayload');
        const taskId = await this.taskService
            .create({ title, description, createdBy: id });
        return c.json({ data: { id: taskId } }, 201);
    };
    getById = async (c) => {
        const id = c.req.param("id");
        const task = await this.taskService.getById(id);
        return c.json({ data: { task } });
    };
    getAll = async (c) => {
        const createdBy = c.req.query("createdBy");
        const tasks = await this.taskService.getAll(createdBy || undefined);
        return c.json({ data: { tasks } });
    };
    update = async (c) => {
        const id = c.req.param("id");
        const body = await c.req.json();
        const updatedId = await this.taskService.update(id, body);
        return c.json({ data: { id: updatedId } });
    };
    delete = async (c) => {
        const id = c.req.param("id");
        const deletedId = await this.taskService.delete(id);
        return c.json({ id: deletedId });
    };
    assignTaskToWorker = async (c) => {
        const { taskId, workerId } = await c.req.json();
        const taskAssignmentId = await this.taskService.assignTaskToWorker(taskId, workerId);
        return c.json({ data: { taskAssignmentId } });
    };
    unassignTaskFromWorker = async (c) => {
        const { id } = c.req.param();
        const deletedTaskAssignmentId = await this.taskService.unassignTaskFromWorker(id);
        return c.json({ data: { deletedTaskAssignmentId } });
    };
}
