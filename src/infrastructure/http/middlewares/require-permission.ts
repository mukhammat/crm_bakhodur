import { createMiddleware } from 'hono/factory'
import { schema, db } from '../../../database/index.js'
import { eq } from 'drizzle-orm'
import { CustomError } from '../../../core/errors/custom.error.js'

export type AllowedPermission = string

export const requirePermission = (permissions: AllowedPermission[]) => {
  return createMiddleware(async (c, next) => {
    const payload = c.get('jwtPayload') as any

    if (!payload) {
      return c.json({ message: 'Нет доступа!' }, 403)
    }

    const userRoleId = payload.roleId;

    // Get all permission titles from role (rolePermissions)
    const rolePerms = await db.query.rolePermissions.findMany({
      where: eq(schema.rolePermissions.roleId, userRoleId),
      with: {
        permission: true
      }
    });

    // Extract permission titles
    const rolePermissionTitles = rolePerms.map(rp => rp.permission.title);
    
    // Combine all available permissions

    // Check if user has at least one of the required permissions
    const hasAccess = permissions.some(permission => 
      rolePermissionTitles.includes(permission)
    );

    if (!hasAccess) {
      throw new CustomError('Нет доступа! У вас нет необходимых разрешений.', 403)
    }

    await next()
  })
}