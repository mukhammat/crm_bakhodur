import type { InferResultType } from "../../../database/index.js";

export type GetUserDto = Omit<InferResultType<'users'>, 'hash'>

export type UpdateDto = Partial<Omit<GetUserDto, 'hash' | 'id'>>

export type RoleDto = Pick<GetUserDto, 'role'>['role']

export type ParamsType = {
    role?: RoleDto
}