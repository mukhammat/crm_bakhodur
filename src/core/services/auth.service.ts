import bcrypt from "bcrypt"
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { and, eq } from "drizzle-orm";
import { type StringValue } from 'ms';
import { users, type DrizzleClient } from "../../database/index.js";
import { redis } from '../../cache/index.js'
import type { RegisterDto } from "../dto/auth.dto.js";
import { CustomError } from "../errors/custom.error.js";

export interface IAuthService {
    login(email: string, password: string): Promise<{token: string, expiresIn: string}>;
    register(dto: RegisterDto): Promise<string>;
}

export class AuthService implements IAuthService {
    private secretKey = process.env.SECRET_KEY;
    private saltRounds = 10;

    constructor(private db: DrizzleClient) {}

    public async login(email: string, password: string) {
        const user = await this.db
        .query
        .users
        .findFirst({
            where: and(eq(users.email, email)),
        });

        if (!user) {
            throw new CustomError(
                'Неправильные данные!'
            );
        }

        const isPasswordValid = await bcrypt
        .compare(password, user.hash);

        if (!isPasswordValid) {
            throw new CustomError(
                'еправильные данные!'
            );
        }

        const token = this.generateJwt({
            id: user.id,
            email,
            role: user.role
        }, "24h");

        return { token, expiresIn: '24h'};
    }

    public async register({
        email,
        password,
        name,
        key,
        telegramId,
    }: RegisterDto) {
        const role = await redis.get(`register_key:${key}`);

        if (
            role !== 'manager'
        ) {
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
        })
    }

    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(this.saltRounds);
        return bcrypt.hash(password, salt);
    }

    private generateJwt(
        payload: JwtPayload,
        expiresIn: StringValue = '24h'
    ) {
        if (!this.secretKey) {
        throw new CustomError(
            'Secret key is не найден'
        );
        }
        return jwt.sign(
            payload,
            this.secretKey,
            { expiresIn }
        );
    }
}