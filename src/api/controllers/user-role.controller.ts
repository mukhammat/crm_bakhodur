import type { Context } from "hono";
import type { IUserRoleService } from "../../core/services/user-role.service.js";

export class UserRoleController {
  constructor(private userRoleService: IUserRoleService) {}

  generateRegisterKey = async (c: Context) => {
    const role = c.req.param("role");

    if (!role || (role !== "MANAGER" && role !== "WORKER")) {
      return c.json({ error: "Укажите ?role=MANAGER или ?role=WORKER" }, 400);
    }

    const key = await this.userRoleService.generateRegisterKey(role);
    return c.json({ data: { key } });
  };
}
