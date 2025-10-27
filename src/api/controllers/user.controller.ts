import type { Context } from "hono";
import type { ContextJWT } from '../types/context-jwt.js'
import type { IUserService } from "../../core/services/user.service.js";
import type { RoleDto, UpdateDto } from "../../core/dto/user.dto.js";

export class UserController {
  constructor(private userService: IUserService) {}

  getAll = async (c: ContextJWT) => {
    const { roleId } = c.get('jwtPayload');

    // filter by role id
    const params: { roleId?: RoleDto } = { roleId };

    const users = await this.userService.getAll(params);
    return c.json({ users });
  }

  update = async (c: ContextJWT) => {
    const { id } = c.get('jwtPayload');
    const body: UpdateDto = await c.req.json();

    await this.userService.update(id, body);

    return c.json({ data: { id } });
  }

  delete = async (c: ContextJWT) => {
    const userId = c.req.param('id');
    const { id } = c.get('jwtPayload');
    
    if(userId === id) {
      return c.json({ error: 'Вы не можете удалить себя!' }, 400);
    }

    await this.userService.delete(userId);

    return c.json({ data: { id } });
  }

  me = async (c: ContextJWT) => {
    const { id } = c.get('jwtPayload');

    const user = await this.userService.getById(id);

    return c.json({
      user
    })
  }
}
