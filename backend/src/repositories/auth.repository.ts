import prisma from '../config/prisma';
import { Prisma, AuditAction } from '@prisma/client';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      include: {
        role: true,
      },
    });
  }

  async findUserByEmailIncludingDeleted(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        role: true,
      },
    });
  }

  async findRoleByCode(code: string) {
    return prisma.role.findUnique({
      where: { code },
    });
  }

  async createUser(data: Prisma.UserUncheckedCreateInput) {
    return prisma.user.create({
      data,
      include: {
        role: true,
      },
    });
  }

  async updateLastLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  // --- Refresh Token Management ---

  async createRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string
  ) {
    return prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
        ipAddress,
        deviceName: userAgent,
      },
    });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { include: { role: true } } },
    });
  }

  async revokeRefreshToken(token: string, replacedByToken?: string) {
    return prisma.refreshToken.update({
      where: { token },
      data: {
        revokedAt: new Date(),
        replacedByToken,
      },
    });
  }

  async revokeAllUserRefreshTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  // --- Audit Logging ---

  async createAuditLog(
    action: AuditAction,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    details?: any
  ) {
    return prisma.auditLog.create({
      data: {
        action,
        userId,
        ipAddress,
        userAgent,
        details: details || {},
      },
    });
  }
}

export default new AuthRepository();