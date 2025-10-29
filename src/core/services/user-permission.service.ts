import { eq, and } from "drizzle-orm";
import type { DrizzleClient } from "../../database/index.js";
import { schema } from "../../database/index.js";
import type { InferResultType } from "../../database/index.js";

export type UserPermissionType = InferResultType<'userPermissions'>;

export interface IUserPermissionService {
  getByUserId(userId: string): Promise<UserPermissionType[]>;
  assignPermissionToUser(userId: string, permissionId: string): Promise<Pick<UserPermissionType, 'id'>>;
  removePermissionFromUser(userId: string, permissionId: string): Promise<void>;
  checkPermissionExists(userId: string, permissionId: string): Promise<boolean>;
}

export class UserPermissionService implements IUserPermissionService {
  constructor(private db: DrizzleClient) {}

  async getByUserId(userId: string) {
    return this.db.query.userPermissions.findMany({
      where: eq(schema.userPermissions.userId, userId),
      with: {
        permission: true,
        user: {
          columns: {
            hash: false,
          }
        }
      }
    });
  }

  async assignPermissionToUser(userId: string, permissionId: string) {
    const [assigned] = await this.db
      .insert(schema.userPermissions)
      .values({ userId, permissionId })
      .onConflictDoNothing()
      .returning({ id: schema.userPermissions.id });

    return assigned;
  }

  async removePermissionFromUser(userId: string, permissionId: string) {
    await this.db
      .delete(schema.userPermissions)
      .where(and(
        eq(schema.userPermissions.userId, userId),
        eq(schema.userPermissions.permissionId, permissionId)
      ));
  }

  async checkPermissionExists(userId: string, permissionId: string) {
    const existing = await this.db.query.userPermissions.findFirst({
      where: and(
        eq(schema.userPermissions.userId, userId),
        eq(schema.userPermissions.permissionId, permissionId)
      )
    });
    return !!existing;
  }
}

