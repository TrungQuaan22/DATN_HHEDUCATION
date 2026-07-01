import z from 'zod'

export const loginBodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().trim().min(8).max(64)
})

export const loginSchema = z.object({
  body: loginBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional()
})

export const refreshTokenBodySchema = z
  .object({
    refreshToken: z.string().trim().min(1)
  })
  .strict()

export const refreshTokenSchema = z.object({
  body: refreshTokenBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional()
})

export const registerBodySchema = z
  .object({
    fullName: z.string().trim().min(2).max(100),
    email: z.string().trim().toLowerCase().email(),
    password: z
      .string()
      .trim()
      .min(8)
      .max(64)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/,
        'Password must contain uppercase, lowercase, number and special character'
      ),
    confirmPassword: z.string().trim().min(8).max(64)
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Confirm password does not match',
    path: ['confirmPassword']
  })

export const registerSchema = z.object({
  body: registerBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional()
})
