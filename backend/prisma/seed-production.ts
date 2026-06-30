import 'dotenv/config'

import { hash } from 'bcrypt'
import { PrismaClient, UserRole, UserStatus } from '@prisma/client'

const prisma = new PrismaClient()

type ProductionUserConfig = {
  emailEnv: string
  passwordEnv: string
  fullNameEnv: string
  defaultFullName: string
  role: UserRole
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`${name} is required for the production seed`)
  }

  return value
}

async function upsertProductionUser(config: ProductionUserConfig): Promise<void> {
  const email = requiredEnv(config.emailEnv).toLowerCase()
  const password = requiredEnv(config.passwordEnv)
  const fullName = process.env[config.fullNameEnv]?.trim() || config.defaultFullName

  if (password.length < 12) {
    throw new Error(`${config.passwordEnv} must contain at least 12 characters`)
  }

  const saltRounds = Number(process.env.AUTH_PASSWORD_SALT_ROUNDS ?? 12)
  const passwordHash = await hash(password, saltRounds)

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      fullName,
      role: config.role,
      status: UserStatus.active
    },
    update: {
      passwordHash,
      fullName,
      role: config.role,
      status: UserStatus.active,
      deletedAt: null
    }
  })

  console.log(`Production ${config.role} is ready: ${email}`)
}

async function main(): Promise<void> {
  await upsertProductionUser({
    emailEnv: 'PRODUCTION_ADMIN_EMAIL',
    passwordEnv: 'PRODUCTION_ADMIN_PASSWORD',
    fullNameEnv: 'PRODUCTION_ADMIN_FULL_NAME',
    defaultFullName: 'System Administrator',
    role: UserRole.admin
  })

  await upsertProductionUser({
    emailEnv: 'PRODUCTION_TEACHER_EMAIL',
    passwordEnv: 'PRODUCTION_TEACHER_PASSWORD',
    fullNameEnv: 'PRODUCTION_TEACHER_FULL_NAME',
    defaultFullName: 'Course Teacher',
    role: UserRole.teacher
  })
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
