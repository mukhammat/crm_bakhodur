import { type InferResultType } from '../../database/index.js'

export type TaskType = InferResultType<'tasks'>;

export type CreateDto = Pick<TaskType, 'title' | 'description' | 'createdBy' | 'priority'>

export type UpdateDto = Partial<Pick<TaskType, "title" | "description" | "status" | "dueDate">>;

export type ParamsType = 
Partial<Pick<TaskType, 'status' | 'createdBy' | 'priority' | 'dueDate' | 'createdAt'>> & {
    offset?: number
}

export type AssignmentLength = {
    status: "pending" | "in_progress" | "completed";
    count: number;
}

export type Assignment = InferResultType<'taskAssignments'> & {
    task: TaskType
}