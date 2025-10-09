import z from 'zod';
const email = z.email().nonempty();
const password = z.string().min(6);
export const LoginSchema = z.object({
    email,
    password,
});
export const RegisterSchema = z.object({
    email,
    password,
    name: z.string().min(2),
    key: z.string(),
    telegramId: z.number().nullable()
});
