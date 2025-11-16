import bcrypt from "bcrypt"
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { and, eq } from "drizzle-orm";
import { type StringValue } from 'ms';
import { users, userRoles, type DrizzleClient } from "../../database/index.js";
import { redis } from '../../cache/redis.js'
import type { RegisterDto, ReturnType } from "../dto/auth.dto.js";
import { CustomError } from "../errors/custom.error.js";

export interface IAuthService {
    login(email: string, password: string): Promise<ReturnType>;
    register(dto: RegisterDto): Promise<ReturnType>;
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
            columns: {
                id: true,
                roleId: true,
                hash: true
            }
        });

        if (!user) {
            throw new CustomError(
                'Invalid credentials!'
            );
        }

        const isPasswordValid = await bcrypt
        .compare(password, user.hash);

        if (!isPasswordValid) {
            throw new CustomError(
                'Invalid credentials!'
            );
        }

        const token = this.generateJwt({
            id: user.id,
            email,
            roleId: user.roleId
        }, "24h");

        return { token, expiresIn: '24h', user: { id: user.id, roleId: user.roleId }};
    }

    public async register({
        email,
        password,
        name,
        key,
        telegramId,
    }: RegisterDto) {
        const roleValue = await redis.get(`register_key:${key}`);

        if (!roleValue) {
            throw new CustomError('Registration key not found!');
        }

        // roleValue can be either role id (stored by user-role service) or role title
        let role;
        if (/^\d+$/.test(roleValue)) {
            // numeric id
            const id = Number(roleValue);
            role = await this.db.query.userRoles.findFirst({ where: eq(userRoles.id, id) });
        } else {
            role = await this.db.query.userRoles.findFirst({ where: eq(userRoles.title, roleValue) });
        }

        if (!role) {
            throw new CustomError('Specified role not found in the system!');
        }

        const hash = await this.hashPassword(password);

        const user = await this.db.transaction(async (tx) => {
            const [newUser] = await tx
            .insert(users)
            .values({
                email,
                hash: hash,
                roleId: role.id,
                name,
                telegramId
            })
            .returning({
                id: users.id,
                roleId: users.roleId
            });


            return newUser;
        })

        const token = this.generateJwt({
            id: user.id,
            email,
            roleId: user.roleId
        }, "24h");

        return { token, expiresIn: '24h', user };
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
            'Secret key not found'
        );
        }
        return jwt.sign(
            payload,
            this.secretKey,
            { expiresIn }
        );
    }
}