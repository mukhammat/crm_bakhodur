import { Hono } from "hono";
import { UserService } from "../../core/services/user.service.js";
import { UserController } from "../controllers/user.controller.js";
import { requireAuth } from '../middlewares/require-auth.js'
import { requireRole } from '../middlewares/require-role.js'
import type { DrizzleClient } from "../../database/index.js";

export const userRouter = (db: DrizzleClient) => {
  const userController = new UserController(new UserService(db));

  return new Hono()
  .use(requireAuth)
  .get('/me', userController.me)
  .use(requireRole(['MANAGER', 'ADMIN']))
  .get('/', userController.getAll)
  .put('/', userController.update)
  .use(requireRole(['ADMIN']))
  .delete('/:id', userController.delete)
};
