import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export class UserRepository {
  async findUsers(filters: { search?: string; role?: string; page: number; limit: number }) {
    const whereClause: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (filters.role) {
      whereClause.role = { code: filters.role };
    }

    if (filters.search) {
      whereClause.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const skip = (filters.page - 1) * filters.limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          role: { select: { id: true, code: true, name: true } }
        }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    return { users, total };
  }

  async findUserById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        role: { select: { id: true, code: true, name: true } }
      }
    });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        role: { select: { id: true, code: true, name: true } }
      }
    });
  }

  async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        role: { select: { id: true, code: true, name: true } }
      }
    });
  }

  async deleteUser(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async countUsersByRoleCode(code: string) {
    return prisma.user.count({
      where: { role: { code }, deletedAt: null }
    });
  }

  async findRoleByCode(code: string) {
    return prisma.role.findUnique({ where: { code } });
  }
}

export default new UserRepository();
