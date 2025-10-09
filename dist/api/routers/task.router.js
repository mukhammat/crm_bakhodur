import { Hono } from "hono";
import { TaskService } from "../../core/services/task.service.js";
import { TaskController } from "../controllers/task.controller.js";
import { requireAuth } from '../middleware/require-auth.js';
import { requireRole } from "../middleware/require-role.js";
import { zValidator } from "@hono/zod-validator";
import { CreateSchema, UpdateSchema, AssignTaskToUserSchema } from '../../core/schemas/task.schema.js';
export const taskRouter = (db) => {
    const taskController = new TaskController(new TaskService(db));
    return new Hono()
        .use(requireAuth)
        .use(requireRole([
        'admin',
        'manager'
    ]))
        .post("/", zValidator('json', CreateSchema), taskController.create)
        .get("/", taskController.getAll)
        .get("/:id", taskController.getById)
        .post('/assign-task-worker', zValidator('json', AssignTaskToUserSchema), taskController.assignTaskToUser)
        .delete('/unassign-task-from-worker/:id', taskController.unassignTaskFromUser)
        .put("/:id", taskController.update)
        .use(requireRole(['admin']))
        .delete("/:id", taskController.delete)
        .get('/assignment-length/:id', taskController.getAssignmentLengthByUserId);
};
