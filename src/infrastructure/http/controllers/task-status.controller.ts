import type { Context } from 'hono'
import type { ITaskStatusService } from '../../../core/services/task-status.service.js'
import type { CreateDto, UpdateDto } from '../../../core/dto/task-status.dto.js'
import { CustomError } from '../../../core/errors/custom.error.js';

export class TaskStatusController {
    constructor(private taskStatusService: ITaskStatusService) {}

    create = async (c: Context) => {
        const data: CreateDto = await c.req.json();

        const id = await this.taskStatusService.create(data);

        return c.json({taskStatus: { id }}, 201);
    }

    getById = async (c: Context) => {
        const id = c.req.param('id');

        const validId = Number(id);

        if(isNaN(validId)) {
            throw new CustomError('Invalid format', 401);
        }

        const taskStatus = await this.taskStatusService.getById(validId)

        return c.json({ taskStatus })
    }

    getAll = async (c: Context) => {
        const taskStatuses = await this.taskStatusService.getAll();
        return c.json({ taskStatuses })
    }

    update = async (c: Context) => {
        const id = c.req.param('id');
        const data: UpdateDto = await c.req.json();

        const validId = Number(id);

        if(isNaN(validId)) {
            throw new CustomError('Invalid format', 401);
        }

        const taskStatusId = await this.taskStatusService.update(validId, data);
        return c.json({ taskStatus: {id: taskStatusId} })
    }

    delete = async (c: Context) => {
        const id = c.req.param('id');

        const validId = Number(id);

        if(isNaN(validId)) {
            throw new CustomError('Invalid format', 401);
        }

        const taskStatusId = 
            await this.taskStatusService.delete(validId);

        return c.json({ taskStatus: {id: taskStatusId} })
    }
}