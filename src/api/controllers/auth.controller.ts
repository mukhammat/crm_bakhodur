import type { Context } from "hono";
import type { IAuthService } from "../../core/services/auth.service.js";
import type { LoginDTO } from "../../core/schemas/auth.schema.js";

export class AuthController {
    constructor(private authService: IAuthService) {}

    login = async (c: Context) => {
        const { email, password } = await c.req.json();
        const returnData = await this.authService.login(email, password);
        return c.json(returnData);
    }

    register = async (c: Context) => {
        const dto = await c.req.json();
        const returnData = await this.authService.register(dto);
        return c.json(returnData, 201);
    }
}
