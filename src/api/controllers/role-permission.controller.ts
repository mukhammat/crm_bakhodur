import type { Context } from 'hono';
import type { IRolePermissionService } from '../../core/services/role-permission.service.js';
import { CustomError } from '../../core/errors/custom.error.js';

export class RolePermissionController {
  constructor(private rolePermissionService: IRolePermissionService) {}

  getByRoleId = async (c: Context) => {
    const roleId = parseInt(c.req.param('roleId'));
    
    if (isNaN(roleId)) {
      throw new CustomError('Неверный ID роли', 400);
    }

    const permissions = await this.rolePermissionService.getByRoleId(roleId);
    return c.json({ permissions });
  };

  assignPermission = async (c: Context) => {
    const roleId = parseInt(c.req.param('roleId'));
    const { permissionId } = await c.req.json();

    if (isNaN(roleId)) {
      throw new CustomError('Неверный ID роли', 400);
    }

    if (!permissionId) {
      throw new CustomError('ID разрешения обязателен', 400);
    }

    const assigned = await this.rolePermissionService.assignPermissionToRole(roleId, permissionId);
    return c.json({ permission: assigned }, 201);
  };

  removePermission = async (c: Context) => {
    const roleId = parseInt(c.req.param('roleId'));
    const { permissionId } = await c.req.json();

    if (isNaN(roleId)) {
      throw new CustomError('Неверный ID роли', 400);
    }

    if (!permissionId) {
      throw new CustomError('ID разрешения обязателен', 400);
    }

    await this.rolePermissionService.removePermissionFromRole(roleId, permissionId);
    return c.json({ message: 'Разрешение удалено из роли' });
  };
}

