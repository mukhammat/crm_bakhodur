import { Hono } from "hono";
import { UserService } from "./user.service.js";
import { UserController } from "./user.controller.js";
import { requireAuth } from '../../middleware/require-auth.js'
import { requireRole } from '../../middleware/require-role.js'
import type { DrizzleClient } from "../../../database/index.js";

export const userRouter = (db: DrizzleClient) => {
  const userController = new UserController(new UserService(db));

  return new Hono()
  .use(requireAuth)
  .get('/me', userController.me)
  .get('/', requireRole(['manager', 'admin']), userController.getAll)
  .put('/', requireRole(['manager', 'admin']), userController.update)
  .use(requireRole(['admin']))
  .get("/register-key/:role", userController.generateRegisterKey)
  .delete('/:id', userController.delete)
};
