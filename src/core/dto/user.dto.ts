import type { InferResultType } from "../../database/index.js";

export type GetUserDto = Omit<InferResultType<'users'>, 'hash'>

export type UpdateDto = Partial<Omit<GetUserDto, 'hash' | 'id'>>

export type Role = {
    id: number;
    title: string;
}

export type RoleDto = Role['title']

export type ParamsType = {
    role?: string
}