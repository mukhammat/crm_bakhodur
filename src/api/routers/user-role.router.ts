import { Hono } from "hono";
import { UserRoleController } from "../controllers/user-role.controller.js";
import { requireAuth } from "../middlewares/require-auth.js";
import { requirePermission } from "../middlewares/require-permission.js";
import { UserRoleService } from "../../core/services/user-role.service.js";
import type { DrizzleClient } from "../../database/index.js";

export function userRoleRouter(db: DrizzleClient) {
    const controller = new UserRoleController(new UserRoleService(db))

    const router = new Hono();

    router.use(requireAuth);
    router.use(requirePermission(['MANAGE_PERMISSIONS']));

    router
        .get('/', controller.getAll)
        .get('/:id', controller.getById)
        .post('/', controller.create)
        .put('/:id', controller.update)
        .delete('/:id', controller.delete)
        .get('/generate-key/:role', controller.generateRegisterKey);

    return router;
}