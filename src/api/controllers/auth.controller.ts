import type { Context } from "hono";
import type { IAuthService } from "../../core/services/auth.service.js";

export class AuthController {
    constructor(private authService: IAuthService) {}

    login = async (c: Context) => {
        const { email, password } = await c.req.json();
        const token = await this.authService.login(email, password);
        return c.json({ data: { token } });
    }

    register = async (c: Context) => {
        const dto = await c.req.json();
        const userId = await this.authService.register(dto);
        return c.json({ data: { userId } }, 201);
    }
}
