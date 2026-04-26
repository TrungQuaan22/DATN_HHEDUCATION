import z from "zod";

export const loginBodySchema = z
.object({
    email: z.string().email(),
    password: z.string().min(6)
})

export const loginSchema = z.object({
    body: loginBodySchema,
    params: z.object({}).optional(),
    query: z.object({}).optional()
})