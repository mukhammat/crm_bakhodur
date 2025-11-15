import { Hono } from "hono";
import { TaskController } from "../controllers/task.controller.js";
import { requireAuth } from '../middlewares/require-auth.js';
import { requirePermission } from "../middlewares/require-permission.js";
import { zValidator } from "@hono/zod-validator";
import { CreateSchema, UpdateSchema } from '../../../core/schemas/task.schema.js'

export const taskRouter = (taskController: TaskController) => {

  return new Hono()
    .use(requireAuth)
    .use(requirePermission(['VIEW_TASKS']))
    .get("/", taskController.getAll)
    .get("/:id", taskController.getById)
    .use(requirePermission(['CREATE_TASKS']))
    .post("/", zValidator('json', CreateSchema), taskController.create)
    .use(requirePermission(['UPDATE_TASKS']))
    .put("/:id", zValidator('json', UpdateSchema), taskController.update)
    .use(requirePermission(['DELETE_TASKS']))
    .delete("/:id", taskController.delete)
};
