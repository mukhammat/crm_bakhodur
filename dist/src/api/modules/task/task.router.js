import { Hono } from "hono";
import { TaskService } from "./task.service.js";
import { TaskController } from "./task.controller.js";
import { requireAuth } from '../../middleware/require-auth.js';
import { requireRole } from "../../middleware/require-role.js";
export const taskRouter = (db) => {
    const taskController = new TaskController(new TaskService(db));
    return new Hono()
        .use(requireAuth)
        .use(requireRole([
        'admin',
        'manager'
    ]))
        .post("/", taskController.create)
        .get("/", taskController.getAll)
        .get("/:id", taskController.getById)
        .use(requireRole(['admin']))
        .put("/:id", taskController.update)
        .delete("/:id", taskController.delete)
        .post('/assign-task-worker', taskController.assignTaskToWorker)
        .delete('/unassign-task-from-worker/:id', taskController.unassignTaskFromWorker);
};
