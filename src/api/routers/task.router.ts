import { Hono } from "hono";
import type { DrizzleClient } from "../../database/index.js";
import { TaskService } from "../../core/services/task.service.js";
import { TaskController } from "../controllers/task.controller.js";
import { requireAuth } from '../middlewares/require-auth.js';
import { requirePermission } from "../middlewares/require-permission.js";
import { zValidator } from "@hono/zod-validator";
import { CreateSchema, UpdateSchema, AssignTaskToUserSchema } from '../../core/schemas/task.schema.js'

export const taskRouter = (db: DrizzleClient) => {
  const taskController = new TaskController(new TaskService(db));

  return new Hono()
    .use(requireAuth)
    .use(requirePermission(['VIEW_TASKS']))
    .get("/", taskController.getAll)
    .get("/:id", taskController.getById)
    .use(requirePermission(['CREATE_TASKS']))
    .post("/", zValidator('json', CreateSchema), taskController.create)
    .post(
      '/assign-task-worker',
      zValidator('json', AssignTaskToUserSchema),
      taskController.assignTaskToUser
    )
    .delete('/unassign-task-from-worker/:id', taskController.unassignTaskFromUser)
    .use(requirePermission(['UPDATE_TASKS']))
    .put("/:id", zValidator('json', UpdateSchema), taskController.update)
    .use(requirePermission(['DELETE_TASKS']))
    .delete("/:id", taskController.delete)
    .get('/assignment-length/:id', taskController.getAssignmentLengthByUserId)
};
