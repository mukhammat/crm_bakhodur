import { z } from 'zod';

export const CreateRoleSchema = z.object({
  title: z.string().min(1).max(50)
});

export const UpdateRoleSchema = z.object({
  title: z.string().min(1).max(50)
});

export const CreateStatusSchema = z.object({
  title: z.string().min(1).max(50)
});

export const UpdateStatusSchema = z.object({
  title: z.string().min(1).max(50)
});
