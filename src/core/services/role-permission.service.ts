import { eq, and } from "drizzle-orm";
import type { DrizzleClient } from "../../database/index.js";
import { schema } from "../../database/index.js";
import type { InferResultType } from "../../database/index.js";

export type RolePermissionType = InferResultType<'rolePermissions'>;

export interface IRolePermissionService {
  getByRoleId(roleId: number): Promise<RolePermissionType[]>;
  assignPermissionToRole(roleId: number, permissionId: string): Promise<Pick<RolePermissionType, 'id'>>;
  removePermissionFromRole(roleId: number, permissionId: string): Promise<void>;
  checkPermissionExists(roleId: number, permissionId: string): Promise<boolean>;
}

export class RolePermissionService implements IRolePermissionService {
  constructor(private db: DrizzleClient) {}

  async getByRoleId(roleId: number) {
    return this.db.query.rolePermissions.findMany({
      where: eq(schema.rolePermissions.roleId, roleId),
      with: {
        permission: true,
        role: true,
      }
    });
  }

  async assignPermissionToRole(roleId: number, permissionId: string) {
    const [assigned] = await this.db
      .insert(schema.rolePermissions)
      .values({ roleId, permissionId })
      .onConflictDoNothing()
      .returning({ id: schema.rolePermissions.id });

    return assigned;
  }

  async removePermissionFromRole(roleId: number, permissionId: string) {
    await this.db
      .delete(schema.rolePermissions)
      .where(and(
        eq(schema.rolePermissions.roleId, roleId),
        eq(schema.rolePermissions.permissionId, permissionId)
      ));
  }

  async checkPermissionExists(roleId: number, permissionId: string) {
    const existing = await this.db.query.rolePermissions.findFirst({
      where: and(
        eq(schema.rolePermissions.roleId, roleId),
        eq(schema.rolePermissions.permissionId, permissionId)
      )
    });
    return !!existing;
  }
}

