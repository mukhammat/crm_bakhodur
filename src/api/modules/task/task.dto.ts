import { type InferResultType } from '../../../database/index.js'

export type CreateDto = Pick<InferResultType<'tasks'>, 'title' | 'description' | 'createdBy'>

export type UpdateDto = Partial<Pick<InferResultType<'tasks'>, "title" | "description" | "status" | "dueDate">>;