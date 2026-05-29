import { UserRole, UserStatus } from '@prisma/client'

import { prisma } from '~/config/db'

import type {
  AuthRepositoryPort,
  CreateSessionInput,
  CreateStudentInput,
  CreateTeacherInput,
  RotateSessionRefreshTokenInput
} from './ports/auth-repository.port'

export class PrismaAuthRepository implements AuthRepositoryPort {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email }
    })
  }

  //Bypass email verification for now, create active student directly
  createStudent(data: CreateStudentInput) {
    return prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash: data.passwordHash,
        role: UserRole.student,
        status: UserStatus.active
      }
    })
  }

  createTeacher(data: CreateTeacherInput) {
    return prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash: data.passwordHash,
        avatarMediaId: data.avatarMediaId,
        avatarObjectKey: data.avatarObjectKey,
        role: UserRole.teacher,
        status: UserStatus.active
      }
    })
  }

  createSession(data: CreateSessionInput) {
    return prisma.userSession.create({
      data: {
        id: data.id,
        userId: data.userId,
        refreshTokenHash: data.refreshTokenHash,
        expiresAt: data.expiresAt
      }
    })
  }

  findSessionById(id: string) {
    return prisma.userSession.findUnique({
      where: { id },
      include: {
        user: true
      }
    })
  }

  rotateSessionRefreshToken(data: RotateSessionRefreshTokenInput) {
    return prisma.userSession.update({
      where: { id: data.id },
      data: {
        refreshTokenHash: data.refreshTokenHash,
        previousRefreshTokenHash: data.previousRefreshTokenHash,
        previousTokenRotatedAt: new Date(),
        expiresAt: data.expiresAt
      }
    })
  }

  revokeSession(id: string) {
    return prisma.userSession.update({
      where: { id },
      data: {
        isRevoked: true,
        revokedAt: new Date()
      }
    })
  }
}

export const authRepository = new PrismaAuthRepository()
