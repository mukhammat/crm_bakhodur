export class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    login = async (c) => {
        const { email, password } = await c.req.json();
        const token = await this.authService.login(email, password);
        return c.json({ data: token });
    };
    register = async (c) => {
        const dto = await c.req.json();
        const userId = await this.authService.register(dto);
        return c.json({ data: { userId } }, 201);
    };
}
