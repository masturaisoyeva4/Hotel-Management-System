import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { sendSuccess } from '../../utils/response.utils';

const usersService = new UsersService();

export class UsersController {
  // Admin: list all users
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await usersService.findAll(req.query as Record<string, string>);
    sendSuccess(res, result.users, 'Users fetched', 200, result.meta);
  });

  // Admin: get one user
  getOne = asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.findOne(req.params.id);
    sendSuccess(res, user);
  });

  // Self: update own profile
  updateMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await usersService.updateProfile(req.user!.userId, req.body);
    sendSuccess(res, user, 'Profile updated');
  });

  // Self: change own password
  changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    await usersService.changePassword(req.user!.userId, req.body);
    sendSuccess(res, null, 'Password changed successfully');
  });

  // Admin: toggle user active status
  toggleActive = asyncHandler(async (req: Request, res: Response) => {
    const result = await usersService.toggleActive(req.params.id);
    sendSuccess(res, result, 'User status updated');
  });
}
