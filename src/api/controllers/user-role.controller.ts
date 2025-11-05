import type { Context } from "hono";
import type { IUserRoleService } from "../../core/services/user-role.service.js";
import { CustomError } from "../../core/errors/custom.error.js";

export class UserRoleController {
  constructor(private userRoleService: IUserRoleService) {}

  getAll = async (c: Context) => {
    const userRoles = await this.userRoleService.getAll();
    return c.json({ userRoles });
  };

  getById = async (c: Context) => {
    const id = parseInt(c.req.param("id"));
    const userRole = await this.userRoleService.getById(id);
    
    if (!userRole) {
      throw new CustomError("Роль не найдена", 404);
    }
    
    return c.json({ userRole });
  };

  create = async (c: Context) => {
    const { title } = await c.req.json();
    const id = await this.userRoleService.create({ title });
    return c.json({ userRole: { id } }, 201);
  };

  update = async (c: Context) => {
    const id = parseInt(c.req.param("id"));
    const { title } = await c.req.json();
    const updatedId = await this.userRoleService.update(id, { title });
    return c.json({ userRole: { id: updatedId } });
  };

  delete = async (c: Context) => {
    const id = parseInt(c.req.param("id"));
    const deletedId = await this.userRoleService.delete(id);
    return c.json({ userRole: { id: deletedId } });
  };

  generateRegisterKey = async (c: Context) => {
    const role = c.req.param("role");

    if (!role || role === 'ADMIN') {
      return c.json({ error: "Укажите ?role=MANAGER или ?role=WORKER" }, 400);
    }

    const key = await this.userRoleService.generateRegisterKey(role);
    return c.json({ data: { key } });
  };
}
