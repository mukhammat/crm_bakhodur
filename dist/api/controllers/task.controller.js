import { eventBus } from '../../event-bus.js';
export class TaskController {
    taskService;
    constructor(taskService) {
        this.taskService = taskService;
    }
    create = async (c) => {
        const { title, description, priority } = await c.req.json();
        const { id } = c.get('jwtPayload');
        const taskId = await this.taskService
            .create({ title, description, createdBy: id, priority });
        return c.json({ data: { id: taskId } }, 201);
    };
    getById = async (c) => {
        const id = c.req.param("id");
        const task = await this.taskService.getById(id);
        return c.json({ data: { task } });
    };
    getAll = async (c) => {
        const params = c.req.query();
        const tasks = await this.taskService.getAll(params);
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
    assignTaskToUser = async (c) => {
        const { taskId, userId } = await c.req.json();
        const taskAssignmentId = await this.taskService.assignTaskToUser(taskId, userId);
        eventBus.emit('task.assigned', { taskId, userId });
        return c.json({ data: { taskAssignmentId } });
    };
    unassignTaskFromUser = async (c) => {
        const { id } = c.req.param();
        const deletedTaskAssignmentId = await this.taskService.unassignTaskFromUser(id);
        return c.json({ data: { deletedTaskAssignmentId } });
    };
    getAssignmentLengthByUserId = async (c) => {
        const { id } = c.req.param();
        const rows = await this.taskService.getAssignmentLengthByUserId(id);
        return c.json({ rows });
    };
}
