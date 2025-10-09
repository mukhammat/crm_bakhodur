import bcrypt from "bcrypt";
import jwt, {} from 'jsonwebtoken';
import { and, eq } from "drizzle-orm";
import {} from 'ms';
import { users } from "../../database/index.js";
import { redis } from '../../cache/index.js';
import { CustomError } from "../errors/custom.error.js";
export class AuthService {
    db;
    secretKey = process.env.SECRET_KEY;
    saltRounds = 10;
    constructor(db) {
        this.db = db;
    }
    async login(email, password) {
        const user = await this.db
            .query
            .users
            .findFirst({
            where: and(eq(users.email, email)),
        });
        if (!user) {
            throw new CustomError('Неправильные данные!');
        }
        const isPasswordValid = await bcrypt
            .compare(password, user.hash);
        if (!isPasswordValid) {
            throw new CustomError('еправильные данные!');
        }
        const token = this.generateJwt({
            id: user.id,
            email,
            role: user.role
        }, "24h");
        return { token, expiresIn: '24h' };
    }
    async register({ email, password, name, key, telegramId, }) {
        const role = await redis.get(`register_key:${key}`);
        if (role !== 'manager') {
            throw new CustomError('Ключь регистраций не найден!');
        }
        const hash = await this.hashPassword(password);
        return this.db.transaction(async (tx) => {
            const [newUser] = await tx
                .insert(users)
                .values({
                email,
                hash: hash,
                role: role,
                name,
                telegramId
            })
                .returning({
                id: users.id
            });
            return newUser.id;
        });
    }
    async hashPassword(password) {
        const salt = await bcrypt.genSalt(this.saltRounds);
        return bcrypt.hash(password, salt);
    }
    generateJwt(payload, expiresIn = '24h') {
        if (!this.secretKey) {
            throw new CustomError('Secret key is не найден');
        }
        return jwt.sign(payload, this.secretKey, { expiresIn });
    }
}
