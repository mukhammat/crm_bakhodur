import { Hono } from "hono";
import { UserService } from "../../core/services/user.service.js";
import { UserController } from "../controllers/user.controller.js";
import { requireAuth } from '../middleware/require-auth.js'
import { requireRole } from '../middleware/require-role.js'
import type { DrizzleClient } from "../../database/index.js";

export const userRouter = (db: DrizzleClient) => {
  const userController = new UserController(new UserService(db));

  return new Hono()
  .use(requireAuth)
  .get('/me', userController.me)
  .get('/', requireRole(['MANAGER', 'ADMIN']), userController.getAll)
  .put('/', requireRole(['MANAGER', 'ADMIN']), userController.update)
  .use(requireRole(['ADMIN']))
  .delete('/:id', userController.delete)
};
