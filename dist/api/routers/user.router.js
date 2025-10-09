import { Hono } from "hono";
import { UserService } from "../../core/services/user.service.js";
import { UserController } from "../controllers/user.controller.js";
import { requireAuth } from '../middleware/require-auth.js';
import { requireRole } from '../middleware/require-role.js';
export const userRouter = (db) => {
    const userController = new UserController(new UserService(db));
    return new Hono()
        .use(requireAuth)
        .get('/me', userController.me)
        .get('/', requireRole(['manager', 'admin']), userController.getAll)
        .put('/', requireRole(['manager', 'admin']), userController.update)
        .use(requireRole(['admin']))
        .get("/register-key/:role", userController.generateRegisterKey)
        .delete('/:id', userController.delete);
};
