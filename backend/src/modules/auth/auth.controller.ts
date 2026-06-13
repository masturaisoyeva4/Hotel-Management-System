import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { sendSuccess } from '../../utils/response.utils';

const authService = new AuthService();

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 'Registered successfully', 201);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    sendSuccess(res, result, 'Logged in successfully');
  });

  logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    await authService.logout(req.user!.userId);
    sendSuccess(res, null, 'Logged out successfully');
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const tokens = await authService.refreshTokens(req.body.refreshToken);
    sendSuccess(res, tokens, 'Tokens refreshed');
  });

  getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await authService.getMe(req.user!.userId);
    sendSuccess(res, user);
  });
}
