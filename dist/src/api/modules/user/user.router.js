import { Hono } from "hono";
import { UserService } from "./user.service.js";
import { UserController } from "./user.controller.js";
import { requireAuth } from '../../middleware/require-auth.js';
import { requireRole } from '../../middleware/require-role.js';
export const userRouter = (db) => {
    const userController = new UserController(new UserService(db));
    return new Hono()
        .use(requireAuth)
        .use(requireRole(['admin']))
        .get("/register-key/:role", userController.generateRegisterKey)
        .get('/', userController.getAll)
        .put('/', userController.update)
        .delete('/', userController.delete);
};
