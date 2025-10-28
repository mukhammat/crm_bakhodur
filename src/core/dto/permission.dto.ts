import { type InferResultType } from '../../database/index.js'

export type PermissionType = InferResultType<'permissions'>;

export type CreateDto = Pick<PermissionType, 'title'>;

export type UpdateDto = Partial<CreateDto>;

