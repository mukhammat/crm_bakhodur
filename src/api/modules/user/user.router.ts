import { Hono } from "hono";
import { UserService } from "./user.service.js";
import { UserController } from "./user.controller.js";
import { requireAuth } from '../../middleware/require-auth.js'
import { requireRole } from '../../middleware/require-role.js'

export const userRouter = () => {
  const userController = new UserController(new UserService());

  return new Hono()
  .use(requireAuth)
  .use(requireRole(['admin']))
  .get("/register-key", userController.generateRegisterKey);
};
