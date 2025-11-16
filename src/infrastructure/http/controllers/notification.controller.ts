import type { Context } from "hono";
import type { INotificationService } from "../../../core/services/notification.service.js";
import { CustomError } from "../../../core/errors/custom.error.js";

export class NotificationController {
    constructor(private notificationService: INotificationService) {}

    create = async (c: Context) => {
        const data: {
            userId: string
        } = await c.req.json();

        if(typeof data.userId !== 'string') {
            throw new CustomError('userId must be a string')
        }

        const notification = 
        await this.notificationService.create(data);

        return c.json({ notification }, 201)
    }

    getAll = async (c: Context) => {
        const notifications = 
        await this.notificationService.getAll();

        return c.json({ notifications })
    }

    getById = async (c: Context) => {
        const { id } = c.req.param();
        const notifications = 
        await this.notificationService.getById(id);

        return c.json({ notifications })
    }

    delete = async (c: Context) => {
        const { id } = c.req.param();
        const notification = 
        await this.notificationService.getById(id);

        return c.json({ notification })
    }
}