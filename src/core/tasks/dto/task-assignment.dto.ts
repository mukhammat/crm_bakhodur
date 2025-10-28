import { type InferResultType } from '../../../database/index.js'

export type TaskType = InferResultType<'tasks'>;

export type AssignmentLength = {
    status: string;
    count: number;
}

export type Assignment = InferResultType<'taskAssignments'> & {
    task: TaskType
}