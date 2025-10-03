import { Hono } from "hono";
import type { DrizzleClient } from "../../database/index.js"
import { AuthController } from "../controllers/auth.controller.js"
import { AuthService } from "../../core/services/auth.service.js";

export const authRouter = (db: DrizzleClient) => {
    const authController = new AuthController(new AuthService(db));

    return new Hono()

    .post('/register', authController.register)
    
    .post('/login', authController.login)
}
