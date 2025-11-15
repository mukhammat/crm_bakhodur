import { Hono } from "hono";
import { UserController } from "../controllers/user.controller.js";
import { requireAuth } from '../middlewares/require-auth.js'
import { requirePermission } from '../middlewares/require-permission.js'

export const userRouter = (userController: UserController) => {
  return new Hono()
  .use(requireAuth)
  .get('/me', userController.me)
  .use(requirePermission(['VIEW_USERS']))
  .get('/', userController.getAll)
  .put('/', userController.update)
  .use(requirePermission(['DELETE_USERS']))
  .delete('/:id', userController.delete)
  .post('/save-fcm-token', userController.saveFcmToken)
};
