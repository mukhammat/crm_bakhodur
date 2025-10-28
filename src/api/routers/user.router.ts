import { Hono } from "hono";
import { UserService } from "../../core/services/user.service.js";
import { UserController } from "../controllers/user.controller.js";
import { requireAuth } from '../middlewares/require-auth.js'
import { requirePermission } from '../middlewares/require-permission.js'
import type { DrizzleClient } from "../../database/index.js";

export const userRouter = (db: DrizzleClient) => {
  const userController = new UserController(new UserService(db));

  return new Hono()
  .use(requireAuth)
  .get('/me', userController.me)
  .use(requirePermission(['VIEW_USERS']))
  .get('/', userController.getAll)
  .put('/', userController.update)
  .use(requirePermission(['DELETE_USERS']))
  .delete('/:id', userController.delete)
};
