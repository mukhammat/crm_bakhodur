import { users, type DrizzleClient } from "../../database/index.js";
import type { GetUserDto, ParamsType, RoleDto, UpdateDto } from "../dto/user.dto.js";
import { and, eq } from "drizzle-orm";

export interface IUserService {
  getAll(params?: ParamsType): Promise<GetUserDto[]>
  update(userId: string, data: UpdateDto): Promise<string>
  delete(userId: string): Promise<string>
  getById(userId: string): Promise<GetUserDto | undefined>
  getByTelegramId(telegramId: number): Promise<{ id: string } | undefined>
}

export class UserService implements IUserService {
  constructor(private db: DrizzleClient) {}

  public async getAll(params?: ParamsType) {
    const eqs = [];

    if(params?.role) {
      eqs.push(eq(users.role, params.role))
    }

    return this.db
    .query
    .users
    .findMany({
      columns: {
        hash: false
      },
      where: and(...eqs)
    })
  }

  public async update(userId: string, data: UpdateDto) {
    await this.db
    .update(users)
    .set(data)

    return userId
  }

  public async delete(userId: string) {
    await this.db
    .delete(users)
    .where(eq(users.id, userId))

    return userId
  }

  public async getById(userId: string) {
    return this.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        hash: false
      }
    })
  }

  public async getByTelegramId(telegramId: number) {
    return this.db.query.users.findFirst({
      where: eq(users.telegramId, telegramId),
      columns: {
        id: true
      }
    })
  }
}
