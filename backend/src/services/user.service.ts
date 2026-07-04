import userRepository from '../repositories/user.repository';
import { NotFoundError, BadRequestError } from '../utils/errors';

export class UserService {
  async getUsers(filters: { search?: string; role?: string; page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const result = await userRepository.findUsers({
      search: filters.search,
      role: filters.role,
      page,
      limit
    });

    return {
      users: result.users,
      meta: {
        total: result.total,
        page,
        totalPages: Math.ceil(result.total / limit)
      }
    };
  }

  async getUserById(id: string) {
    const user = await userRepository.findUserById(id);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async updateUser(id: string, data: { fullName?: string; avatar?: string }) {
    const user = await userRepository.findUserById(id);
    if (!user) throw new NotFoundError('User not found');

    return userRepository.updateUser(id, data);
  }

  async updateUserRole(id: string, roleCode: string) {
    const user = await userRepository.findUserById(id);
    if (!user) throw new NotFoundError('User not found');

    const role = await userRepository.findRoleByCode(roleCode);
    if (!role) throw new BadRequestError('Invalid role code');

    return userRepository.updateUser(id, { role: { connect: { id: role.id } } });
  }

  async updateUserStatus(id: string, isActive: boolean) {
    const user = await userRepository.findUserById(id);
    if (!user) throw new NotFoundError('User not found');

    return userRepository.updateUser(id, { isActive });
  }
}

export default new UserService();
