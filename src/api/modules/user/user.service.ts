import { randomBytes } from "crypto";
import { redis } from "../../../cache/index.js";
import { CustomError } from "../../errors/custom.error.js";
import { users, type DrizzleClient } from "../../../database/index.js";
import type { GetUserDto, RoleDto, UpdateDto } from "./user.dto.js";
import { eq } from "drizzle-orm";

export interface IUserService {
  generateRegisterKey(role: RoleDto): Promise<string>;
  getAll(): Promise<GetUserDto[]>
  update(userId: string, data: UpdateDto): Promise<string>
  delete(userId: string): Promise<string>
  getById(userId: string): Promise<GetUserDto | undefined>
}

export class UserService implements IUserService {
  constructor(private db: DrizzleClient) {}

  public async generateRegisterKey(role: RoleDto) {
    if (!["manager", "worker", "admin"].includes(role)) {
      throw new CustomError("Недопустимая роль для регистрации!");
    }

    // генерим случайный ключ (50 символов в hex = 25 байт)
    const key = randomBytes(25).toString("hex");

    // кладем в Redis с TTL 1 час
    await redis.set(`register_key:${key}`, role, 'EX', 3600);

    return key;
  }

  public async getAll() {
    return this.db
    .query
    .users
    .findMany({
      columns: {
        hash: false
      },
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
}
