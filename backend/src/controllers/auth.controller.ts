import { Request, Response } from 'express';
import authService from '../services/auth.service';
import userService from '../services/user.service';
import { sendSuccess } from '../utils/responseHelper';
import { StatusCodes } from 'http-status-codes';

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
// 7 days in milliseconds
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/api/auth',
  });
};

const clearRefreshTokenCookie = (res: Response) => {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/api/auth',
  });
};

const getClientInfo = (req: Request) => ({
  ipAddress: req.ip || req.socket.remoteAddress,
  userAgent: req.headers['user-agent'],
});

export class AuthController {

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const { ipAddress, userAgent } = getClientInfo(req);

    const { user, accessToken, refreshToken } = await authService.login(
      email,
      password,
      ipAddress,
      userAgent
    );

    setRefreshTokenCookie(res, refreshToken);

    return sendSuccess(res, StatusCodes.OK, 'Login successful', {
      user,
      accessToken,
    });
  }

  async register(req: Request, res: Response) {
    const { email, password, fullName } = req.body;
    const { ipAddress, userAgent } = getClientInfo(req);

    const user = await authService.register(email, password, fullName, ipAddress, userAgent);

    return sendSuccess(res, StatusCodes.CREATED, 'Registration successful', { user });
  }

  async refreshToken(req: Request, res: Response) {
    const currentRefreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
    const { ipAddress, userAgent } = getClientInfo(req);

    const { accessToken, refreshToken: newRefreshToken } = await authService.refreshTokens(
      currentRefreshToken,
      ipAddress,
      userAgent
    );

    setRefreshTokenCookie(res, newRefreshToken);

    return sendSuccess(res, StatusCodes.OK, 'Token refreshed successfully', {
      accessToken,
    });
  }

  async logout(req: Request, res: Response) {
    const currentRefreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
    const userId = req.user?.userId;
    const { ipAddress, userAgent } = getClientInfo(req);

    if (userId) {
      await authService.logout(userId, currentRefreshToken, ipAddress, userAgent);
    }

    clearRefreshTokenCookie(res);

    return sendSuccess(res, StatusCodes.OK, 'Logged out successfully');
  }

  async getProfile(req: Request, res: Response) {
    const user = await userService.getUserById(req.user!.userId);
    return sendSuccess(res, StatusCodes.OK, 'Profile fetched', user);
  }

  public updateProfile = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    // Assuming userService handles the updates securely
    const user = await userService.updateUser(userId, req.body);
    return sendSuccess(res, StatusCodes.OK, 'Profile updated successfully', { user });
  };

  public changePassword = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(userId, currentPassword, newPassword);
    return sendSuccess(res, StatusCodes.OK, 'Password changed successfully');
  };
}

export default new AuthController();