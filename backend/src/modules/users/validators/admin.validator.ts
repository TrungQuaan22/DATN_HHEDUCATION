import { UserRole, UserStatus } from '@prisma/client'
import z from 'zod'

export const createTeacherBodySchema = z
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

export const createTeacherSchema = z.object({
  body: createTeacherBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional()
})

export const listUsersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    role: z.nativeEnum(UserRole).optional(),
    status: z.nativeEnum(UserStatus).optional(),
    search: z.string().trim().min(1).max(100).optional()
  })
  .strict()

export const listUsersSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: listUsersQuerySchema
})


export const updateUserStatusBodySchema = z
  .object({
    status: z.nativeEnum(UserStatus)
  })
  .strict()

export const updateUserStatusParamSchema = z
  .object({
    userId: z.string().uuid()
  })
  .strict()

export const updateUserStatusSchema = z.object({
  body: updateUserStatusBodySchema,
  params: updateUserStatusParamSchema,
  query: z.object({}).optional()
})
