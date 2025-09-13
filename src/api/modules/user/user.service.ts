import { randomBytes } from "crypto";
import { redis } from "../../../cache/index.js";
import { CustomError } from "../../errors/custom.error.js";
import { users, type DrizzleClient } from "../../../database/index.js";
import type { GetUserDto, UserUpdateDto } from "./user.dto.js";

export interface IUserService {
  generateRegisterKey(role: "manager" | "admin"): Promise<string>;
  getAll(): Promise<GetUserDto[]>
  update(userId: string, data: UserUpdateDto): Promise<string>
}

export class UserService implements IUserService {
  constructor(private db: DrizzleClient) {}

  public async generateRegisterKey(role: "manager" | "admin") {

    if (!["manager", "admin"].includes(role)) {
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
      }
    })
  }

  public async update(userId: string, data: UserUpdateDto) {
    await this.db
    .update(users)
    .set(data)

    return userId
  }
}
