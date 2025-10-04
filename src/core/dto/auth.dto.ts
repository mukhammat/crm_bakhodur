import type { InferResultType } from "../../database/index.js"

type UserType = InferResultType<'users'>;

export type RegisterDto = {
    email: string,
    password: string,
    name: string,
    key: string,
    telegramId?: number
}

export type UserRoleType = UserType['role'];