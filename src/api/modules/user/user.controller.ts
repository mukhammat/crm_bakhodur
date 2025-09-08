import type { Context } from "hono";
import type { IUserService } from "./user.service.js";

export class UserController {
  constructor(private userService: IUserService) {}

  generateRegisterKey = async (c: Context) => {
    const role = c.req.query("role");

    if (!role || (role !== "manager" && role !== "admin")) {
      return c.json({ error: "Укажите ?role=manager или ?role=admin" }, 400);
    }

    const key = await this.userService.generateRegisterKey(role);
    return c.json({ data: { key } });
  };
}
