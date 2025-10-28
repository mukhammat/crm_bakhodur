import { type InferResultType } from '../../database/index.js'

export type TaskType = InferResultType<'taskStatuses'>

export type CreateDto = Omit<TaskType, 'id'>

export type UpdateDto = Partial<TaskType>