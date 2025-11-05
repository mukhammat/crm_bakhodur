import { Hono } from "hono";
import { AuthController } from "../controllers/auth.controller.js"
import { zValidator } from '@hono/zod-validator'
import { RegisterSchema, LoginSchema } from "../../core/schemas/auth.schema.js";

export const authRouter = (authController: AuthController) => {
    return new Hono()

    .post(
        '/register',
        zValidator('json', RegisterSchema),
        authController.register
    )
    
    .post(
        '/login',
        zValidator('json', LoginSchema),
        authController.login)
}
