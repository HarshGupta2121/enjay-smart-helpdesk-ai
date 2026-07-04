import { Request, Response } from 'express';
import userService from '../services/user.service';
import { sendSuccess } from '../utils/responseHelper';
import { StatusCodes } from 'http-status-codes';

export class UserController {
  public getUsers = async (req: Request, res: Response) => {
    const { page, limit, search, role } = req.query;

    const data = await userService.getUsers({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search: search as string,
      role: role as string,
    });

    return sendSuccess(res, StatusCodes.OK, 'Users fetched successfully', data);
  };

  public getUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    return sendSuccess(res, StatusCodes.OK, 'User fetched successfully', { user });
  };

  public updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await userService.updateUser(id, req.body);
    return sendSuccess(res, StatusCodes.OK, 'User updated successfully', { user });
  };

  public updateUserRole = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;
    const user = await userService.updateUserRole(id, role);
    return sendSuccess(res, StatusCodes.OK, 'User role updated successfully', { user });
  };

  public updateUserStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;
    const user = await userService.updateUserStatus(id, isActive);
    return sendSuccess(res, StatusCodes.OK, 'User status updated successfully', { user });
  };

  public createUser = async (req: Request, res: Response) => {
    const user = await userService.createUser(req.body);
    return sendSuccess(res, StatusCodes.CREATED, 'User created successfully', { user });
  };
}

export default new UserController();
