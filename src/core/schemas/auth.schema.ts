import { z } from 'zod'

const email = z.string().email().min(1)
const password = z.string().min(8)

export const LoginSchema = z.object({
    email,
    password,
});

export type LoginDTO = z.infer<typeof LoginSchema>

export type RegisterDTO = z.infer<typeof RegisterSchema>

export const RegisterSchema = z.object({
    email,
    password,
    name: z.string().min(2),
    key: z.string(),
    telegramId: z.number().nullable()
})