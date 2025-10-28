import { type InferResultType } from '../../../database/index.js'

export type UserRolesType = InferResultType<'userRoles'>

export type UserRolesDto = Pick<UserRolesType, 'title'>
