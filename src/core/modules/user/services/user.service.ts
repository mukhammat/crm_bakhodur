import { users, userRoles, type DrizzleClient } from "../../../database/index.js";
import type { GetUserDto, ParamsType, UpdateDto } from "../../dto/user.dto.js";
import { and, eq, type SQL } from "drizzle-orm";
import { CustomError } from "../../errors/custom.error.js";

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
    const eqs: SQL[] = [];

    if (typeof params?.roleId !== 'undefined') {
      // params.role now contains role id
      eqs.push(eq(users.roleId, params.roleId));
    }

    return this.db
    .query
    .users
    .findMany({
      columns: {
        hash: false
      },
      with: {
        role: true
      },
      where: and(...eqs)
    })
  }

  public async update(userId: string, data: UpdateDto) {
    const [updated] = await this.db
    .update(users)
    .set(data)
    .where(eq(users.id, userId))
    .returning({ id: users.id });

    if (!updated) {
      throw new CustomError("Пользователь для обновления не найден");
    }

    return updated.id
  }

  public async delete(userId: string) {
    const [deleted] = await this.db
    .delete(users)
    .where(eq(users.id, userId))
    .returning({ id: users.id });

    if (!deleted) {
      throw new CustomError("Пользователь для удаления не найден");
    }

    return deleted.id
  }

  public async getById(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        hash: false
      },
      with: {
        role: true
      }
    })

    if(!user) {
      throw new CustomError("Пользователь не найден", 404);
    }

    return user;
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
