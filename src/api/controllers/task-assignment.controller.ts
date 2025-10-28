import type { Context } from 'hono'
import type { ITaskAssignmentService } from '../../core/services/task-assignment.service.js'
import { eventBus } from '../../events/event-bus.js'

export class TaskAssignmentController {
    constructor(private taskAssignmentService: ITaskAssignmentService) {}

    create = async (c: Context) => {
        const { taskId, userId } = await c.req.json()
        const assignment = await this.taskAssignmentService.create(taskId, userId)
        eventBus.emit('task.assigned', { taskId, userId })
        return c.json({ assignment }, 201)
    }

    delete = async (c: Context) => {
        const assignmentId = c.req.param('id')
        const assignment = await this.taskAssignmentService.delete(assignmentId)
        return c.json({ assignment })
    }

    getByUserId = async (c: Context) => {
        const userId = c.req.param('userId')
        const assignments = await this.taskAssignmentService.getByUserId(userId)
        return c.json({ assignments })
    }

    getLengthByUserId = async (c: Context) => {
        const userId = c.req.param('userId')
        const assignmentLengths = await this.taskAssignmentService.getLengthByUserId(userId)
        return c.json({ assignmentLengths })
    }
}