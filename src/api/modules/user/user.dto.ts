import type { InferResultType } from "../../../database/index.js";

export type GetUserDto = Omit<InferResultType<'users'>, 'hash'>

export type UserUpdateDto = Partial<Omit<InferResultType<'users'>, 'hash' | 'id'>>