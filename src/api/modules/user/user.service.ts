import { randomBytes } from "crypto";
import { redis } from "../../../cache/index.js";
import { CustomError } from "../../errors/custom.error.js";

export interface IUserService {
  generateRegisterKey(role: "manager" | "admin"): Promise<string>;
}

export class UserService implements IUserService {
  constructor() {}

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
}
