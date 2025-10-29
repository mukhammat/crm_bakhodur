import type { Context } from 'hono';
import type { IUserPermissionService } from '../../core/services/user-permission.service.js';
import { CustomError } from '../../core/errors/custom.error.js';

export class UserPermissionController {
  constructor(private userPermissionService: IUserPermissionService) {}

  getByUserId = async (c: Context) => {
    const userId = c.req.param('userId');
    
    if (!userId) {
      throw new CustomError('ID пользователя обязателен', 400);
    }

    const permissions = await this.userPermissionService.getByUserId(userId);
    return c.json({ permissions });
  };

  assignPermission = async (c: Context) => {
    const userId = c.req.param('userId');
    const { permissionId } = await c.req.json();

    if (!userId) {
      throw new CustomError('ID пользователя обязателен', 400);
    }

    if (!permissionId) {
      throw new CustomError('ID разрешения обязателен', 400);
    }

    const assigned = await this.userPermissionService.assignPermissionToUser(userId, permissionId);
    return c.json({ permission: assigned }, 201);
  };

  removePermission = async (c: Context) => {
    const userId = c.req.param('userId');
    const { permissionId } = await c.req.json();

    if (!userId) {
      throw new CustomError('ID пользователя обязателен', 400);
    }

    if (!permissionId) {
      throw new CustomError('ID разрешения обязателен', 400);
    }

    await this.userPermissionService.removePermissionFromUser(userId, permissionId);
    return c.json({ message: 'Разрешение удалено из пользователя' });
  };
}

