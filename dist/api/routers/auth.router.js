import { Hono } from "hono";
import { AuthController } from "../controllers/auth.controller.js";
import { AuthService } from "../../core/services/auth.service.js";
import { zValidator } from '@hono/zod-validator';
import { RegisterSchema, LoginSchema } from "../../core/schemas/auth.schema.js";
export const authRouter = (db) => {
    const authController = new AuthController(new AuthService(db));
    return new Hono()
        .post('/register', zValidator('json', RegisterSchema), authController.register)
        .post('/login', zValidator('json', LoginSchema), authController.login);
};
