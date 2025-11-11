import { Hono } from "hono";
import { NotificationController } from '../controllers/notification.controller.js'
import { requirePermission } from "../middlewares/require-permission.js";
import { requireAuth } from "../middlewares/require-auth.js";

export const notificationRouter = (notificationController: NotificationController) => {
    return new Hono()
    .use(requireAuth)
    .use(requirePermission(['MANAGE_PERMISSIONS']))
    .post('/', notificationController.create)
    .get('/', notificationController.getAll)
    .get('/:id', notificationController.getById)
    .delete('/:id', notificationController.delete)
}