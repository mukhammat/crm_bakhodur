import type { InferResultType } from "../../database/index.js"

type UserType = InferResultType<'users'>;

export type ReturnType = {
    token: string,
    expiresIn: string,
    user: Pick<UserType, 'id' | 'roleId'>
};

export type RegisterDto = Pick<UserType, 'email' | 'telegramId' | 'name'> & {
    key: string,
    password: string,
}

