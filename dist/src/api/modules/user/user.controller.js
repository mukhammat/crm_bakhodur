export class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    generateRegisterKey = async (c) => {
        const role = c.req.param("role");
        if (!role || (role !== "manager" && role !== "admin")) {
            return c.json({ error: "Укажите ?role=manager или ?role=admin" }, 400);
        }
        const key = await this.userService.generateRegisterKey(role);
        return c.json({ data: { key } });
    };
    getAll = async (c) => {
        const users = await this.userService.getAll();
        return c.json({ data: { users } });
    };
    update = async (c) => {
        const id = c.req.param('id');
        const { data } = await c.req.json();
        await this.userService.update(id, data);
        return c.json({ data: { id } });
    };
    delete = async (c) => {
        const id = c.req.param('id');
        await this.userService.delete(id);
        return c.json({ data: { id } });
    };
}
