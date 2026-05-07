import { UserRole, UserStatus } from "@prisma/client";

import { prisma } from "~/config/db";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },
  //Bypass email verification for now, create active student directly
  createStudent(data: { fullName: string; email: string; passwordHash: string }) {
    return prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash: data.passwordHash,
        role: UserRole.student,
        status: UserStatus.active,
      },
    });
  },

  createTeacher(data: { fullName: string; email: string; passwordHash: string }) {
    return prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash: data.passwordHash,
        role: UserRole.teacher,
        status: UserStatus.active,
      },
    });
  },

  createSession(data: { id: string; userId: string; refreshTokenHash: string; expiresAt: Date }) {
    return prisma.userSession.create({
      data: {
        id: data.id,
        userId: data.userId,
        refreshTokenHash: data.refreshTokenHash,
        expiresAt: data.expiresAt,
      },
    });
  },

  findSessionById(id: string) {
    return prisma.userSession.findUnique({
      where: { id },
      include: { user: true },
    });
  },

  rotateSessionRefreshToken(data: {
    id: string;
    refreshTokenHash: string;
    previousRefreshTokenHash: string;
    expiresAt: Date;
  }) {
    return prisma.userSession.update({
      where: { id: data.id },
      data: {
        refreshTokenHash: data.refreshTokenHash,
        previousRefreshTokenHash: data.previousRefreshTokenHash,
        previousTokenRotatedAt: new Date(),
        expiresAt: data.expiresAt,
      },
    });
  },

  revokeSession(id: string) {
    return prisma.userSession.update({
      where: { id },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    });
  },
};
