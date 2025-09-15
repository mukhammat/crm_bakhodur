import { randomBytes } from "crypto";
import { redis } from "../../../cache/index.js";
import { CustomError } from "../../errors/custom.error.js";
import { users } from "../../../database/index.js";
import { eq } from "drizzle-orm";
export class UserService {
    db;
    constructor(db) {
        this.db = db;
    }
    async generateRegisterKey(role) {
        if (!["manager", "admin"].includes(role)) {
            throw new CustomError("Недопустимая роль для регистрации!");
        }
        // генерим случайный ключ (50 символов в hex = 25 байт)
        const key = randomBytes(25).toString("hex");
        // кладем в Redis с TTL 1 час
        await redis.set(`register_key:${key}`, role, 'EX', 3600);
        return key;
    }
    async getAll() {
        return this.db
            .query
            .users
            .findMany({
            columns: {
                hash: false
            }
        });
    }
    async update(userId, data) {
        await this.db
            .update(users)
            .set(data);
        return userId;
    }
    async delete(userId) {
        await this.db
            .delete(users)
            .where(eq(users.id, userId));
        return userId;
    }
}
