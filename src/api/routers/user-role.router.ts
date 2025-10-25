import { Hono } from "hono";
import { UserRoleController } from "../controllers/user-role.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import { requireRole } from "../middleware/require-role.js";
import { UserRoleService } from "../../core/services/user-role.service.js";
import type { DrizzleClient } from "../../database/index.js";

export function userRoleRouter(db: DrizzleClient) {
    const controller = new UserRoleController(new UserRoleService(db))

    const router = new Hono();

    router.use('*', requireAuth);
    router.use('*', requireRole(['ADMIN']));

    router.get('/generate-key/:role', controller.generateRegisterKey);

    return router;
}