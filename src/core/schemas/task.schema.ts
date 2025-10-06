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
});

export const UpdateSchema = z.object({
    title: title.optional(),
    description: description.optional(),
    status: z.enum(["pending", "in_progress", "completed"]).optional(),
    dueDate: z.date().nullable().optional(),
});

export const AssignTaskToUserSchema = z.object({
    taskId: uuid,
    userId: uuid
});