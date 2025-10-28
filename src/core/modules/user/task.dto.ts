import { type InferResultType } from '../../../database/index.js'

export type TaskType = InferResultType<'tasks'>;

export type CreateDto = Pick<TaskType, 'title' | 'description' | 'createdBy'> 
& Partial<Pick<TaskType, 'dueDate'>>

export type UpdateDto = Partial<Pick<TaskType, "title" | "description" | "statusId" | "dueDate">>;

export type ParamsType = 
Partial<Pick<TaskType, 'statusId' | 'createdBy' | 'dueDate' | 'createdAt'>> & {
    offset?: number
}

export type AssignmentLength = {
    status: string;
    count: number;
}

export type Assignment = InferResultType<'taskAssignments'> & {
    task: TaskType
}