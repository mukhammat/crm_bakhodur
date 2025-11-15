import { createMiddleware } from 'hono/factory'
import { bootstrap } from '../../../bootstrap.js'
import { CustomError } from '../../../core/errors/custom.error.js'

export type AllowedPermission = string

export const requirePermission = (permissions: AllowedPermission[]) => {
  return createMiddleware(async (c, next) => {
    const payload = c.get('jwtPayload') as any

    if (!payload) {
      return c.json({ message: 'Access denied!' }, 403)
    }

    const userRoleId = payload.roleId;

    // Get all permission titles from role (rolePermissions)
    const rolePerms = await bootstrap.core.services.rolePermissionService.getByRoleId(userRoleId)

    // Extract permission titles
    const rolePermissionTitles = rolePerms.map(rp => rp.permission.title);
    
    // Combine all available permissions

    // Check if user has at least one of the required permissions
    const hasAccess = permissions.some(permission => 
      rolePermissionTitles.includes(permission)
    );

    if (!hasAccess) {
      throw new CustomError('Access denied! Or permission denied.', 403)
    }

    await next()
  })
}