import { createMiddleware } from 'hono/factory'
import { UserRoleService } from '../../core/services/user-role.service.js'
import {db} from '../../database/index.js'
import { CustomError } from '../../core/errors/custom.error.js'

export type AllowedRole = string

export const requireRole = (roles: AllowedRole[]) => {
  const userRole = new UserRoleService(db);

  return createMiddleware(async (c, next) => {
    const payload = c.get('jwtPayload') as any

    if (!payload) {
      return c.json({ message: 'Нет доступа!' }, 403)
    }

    const userRoleId = payload.roleId;
    const role = await userRole.getById(userRoleId);

    if(!roles.includes(role?.title!)) {
      throw new CustomError('Нет доступа!', 403)
    }

    await next()
  })
}