import { createMiddleware } from 'hono/factory'
import { schema, db } from '../../database/index.js'
import { eq } from 'drizzle-orm'
import { CustomError } from '../../core/errors/custom.error.js'

export type AllowedPermission = string

export const requirePermission = (permissions: AllowedPermission[]) => {
  return createMiddleware(async (c, next) => {
    const payload = c.get('jwtPayload') as any

    if (!payload) {
      return c.json({ message: 'Нет доступа!' }, 403)
    }

    const userId = payload.id;
    const userRoleId = payload.roleId;

    // Get all permission titles from role (rolePermissions)
    const rolePerms = await db.query.rolePermissions.findMany({
      where: eq(schema.rolePermissions.roleId, userRoleId),
      with: {
        permission: true
      }
    });

    // Get all permission titles from user-specific permissions (userPermissions)
    const userPerms = await db.query.userPermissions.findMany({
      where: eq(schema.userPermissions.userId, userId),
      with: {
        permission: true
      }
    });

    // Extract permission titles
    const rolePermissionTitles = rolePerms.map(rp => rp.permission.title);
    const userPermissionTitles = userPerms.map(up => up.permission.title);
    
    // Combine all available permissions
    const allUserPermissions = [...rolePermissionTitles, ...userPermissionTitles];

    // Check if user has at least one of the required permissions
    const hasAccess = permissions.some(permission => 
      allUserPermissions.includes(permission)
    );

    if (!hasAccess) {
      throw new CustomError('Нет доступа! У вас нет необходимых разрешений.', 403)
    }

    await next()
  })
}