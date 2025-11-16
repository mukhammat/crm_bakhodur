import { z } from 'zod';

export const uuid = z.uuid();

export const IdSchema = {
    id: uuid
}

const title = z.string().min(1).max(255),
      description = z.string()

export const CreateSchema = z.object({
    title,
    description,
    createdBy: uuid.optional(),
    priority: z.number().min(1, 'Minimum 1').max(5, 'Maximum 5').optional()
});

export const UpdateSchema = z.object({
    title: title.optional(),
    description: description.optional(),
    statusId: z.union([z.number(), z.string().transform((val) => parseInt(val, 10))]).optional(),
    dueDate: z.union([
        z.string(),
        z.null()
    ]).optional(),
});

export const AssignTaskToUserSchema = z.object({
    taskId: uuid,
    userId: uuid
});