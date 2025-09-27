import type { Context } from "hono";
import type { ContextJWT } from '../../types/context-jwt.js'
import type { IUserService } from "./user.service.js";
import type { RoleDto, UpdateDto } from "./user.dto.js";
import { CustomError } from "../../errors/custom.error.js";

export class UserController {
  constructor(private userService: IUserService) {}

  generateRegisterKey = async (c: Context) => {
    const role = c.req.param("role");

    if (!role || (role !== "manager" && role !== "worker")) {
      return c.json({ error: "Укажите ?role=manager или ?role=worker" }, 400);
    }

    const key = await this.userService.generateRegisterKey(role);
    return c.json({ data: { key } });
  };

  getAll = async (c: ContextJWT) => {
    const { role } = c.get('jwtPayload');

    const params: { role?: RoleDto } = { };

    if(role !== 'admin') {
      params.role = 'worker';
    }

    const users = await this.userService.getAll(params);
    return c.json({ data: { users } });
  }

  update = async (c: Context) => {
    const id = c.req.param('id');
    const { data }: {data: UpdateDto} = await c.req.json()

    await this.userService.update(id, data);

    return c.json({ data: { id } });
  }

  delete = async (c: ContextJWT) => {
    const userId = c.req.param('id');
    const { id } = c.get('jwtPayload');
    
    if(userId === id) {
      throw new CustomError('Вы не можете удалить себя!')
    }

    await this.userService.delete(userId);

    return c.json({ data: { id } });
  }

  me = async (c: ContextJWT) => {
    const { id } = c.get('jwtPayload');

    const user = await this.userService.getById(id);

    return c.json({
      data: user || null
    })
  }
}
