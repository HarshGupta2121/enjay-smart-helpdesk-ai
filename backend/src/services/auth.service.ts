import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authRepository from '../repositories/auth.repository';
import { UnauthorizedError, BadRequestError, NotFoundError } from '../utils/errors';
import crypto from 'crypto';

interface TokenPayload {
  userId: string;
  role: string;
}

export class AuthService {
  // Standard short-lived access token
  private readonly ACCESS_TOKEN_EXPIRES_IN = '15m';
  // 7 days in milliseconds
  private readonly REFRESH_TOKEN_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

  private getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('FATAL: JWT_SECRET is not defined in environment variables');
    }
    return secret;
  }

  private generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.getJwtSecret(), {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  private generateRefreshTokenString(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  private hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await authRepository.findUserByEmail(email);

    if (!user || !user.isActive) {
      await authRepository.createAuditLog('LOGIN_FAILED', user?.id, ipAddress, userAgent, { email, reason: 'User not found or inactive' });
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      await authRepository.createAuditLog('LOGIN_FAILED', user.id, ipAddress, userAgent, { reason: 'Invalid password' });
      throw new UnauthorizedError('Invalid credentials');
    }

    await authRepository.updateLastLogin(user.id);

    const accessToken = this.generateAccessToken({ userId: user.id, role: user.role.code });
    const refreshTokenString = this.generateRefreshTokenString();

    // Hash the refresh token before storing it in the database
    const hashedRefreshToken = this.hashRefreshToken(refreshTokenString);

    const expiresAt = new Date(Date.now() + this.REFRESH_TOKEN_DURATION_MS);
    await authRepository.createRefreshToken(user.id, hashedRefreshToken, expiresAt, ipAddress, userAgent);

    await authRepository.createAuditLog('LOGIN_SUCCESS', user.id, ipAddress, userAgent);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.code,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken: refreshTokenString, // Return the raw token to the client
    };
  }

  async register(email: string, password: string, fullName: string, ipAddress?: string, userAgent?: string) {
    const existingUser = await authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new BadRequestError('Email is already registered');
    }

    const customerRole = await authRepository.findRoleByCode('CUSTOMER');
    if (!customerRole) {
      throw new NotFoundError('Default role CUSTOMER not found');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await authRepository.createUser({
      email,
      passwordHash,
      fullName,
      roleId: customerRole.id,
    });

    await authRepository.createAuditLog('ACCOUNT_CREATED', newUser.id, ipAddress, userAgent, { email });

    return {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
    };
  }

  async refreshTokens(token: string, ipAddress?: string, userAgent?: string) {
    // Hash the incoming token to query the database
    const hashedToken = this.hashRefreshToken(token);
    const refreshToken = await authRepository.findRefreshToken(hashedToken);

    if (!refreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (refreshToken.revokedAt) {
      // Security Event: Token reuse detected. Revoke all tokens for this user.
      await authRepository.revokeAllUserRefreshTokens(refreshToken.userId);
      await authRepository.createAuditLog('TOKEN_REFRESH', refreshToken.userId, ipAddress, userAgent, {
        status: 'FAILED',
        reason: 'Attempted reuse of revoked token'
      });
      throw new UnauthorizedError('Token reuse detected. Please login again.');
    }

    if (refreshToken.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedError('Refresh token expired');
    }

    const newRefreshTokenString = this.generateRefreshTokenString();
    const newHashedRefreshToken = this.hashRefreshToken(newRefreshTokenString);
    const expiresAt = new Date(Date.now() + this.REFRESH_TOKEN_DURATION_MS);

    // Rotate token
    await authRepository.revokeRefreshToken(refreshToken.token, newHashedRefreshToken);
    await authRepository.createRefreshToken(refreshToken.userId, newHashedRefreshToken, expiresAt, ipAddress, userAgent);

    const accessToken = this.generateAccessToken({
      userId: refreshToken.user.id,
      role: refreshToken.user.role.code
    });

    await authRepository.createAuditLog('TOKEN_REFRESH', refreshToken.userId, ipAddress, userAgent, { status: 'SUCCESS' });

    return {
      accessToken,
      refreshToken: newRefreshTokenString, // Return the raw token to the client
    };
  }

  async logout(userId: string, refreshTokenStr?: string, ipAddress?: string, userAgent?: string) {
    if (refreshTokenStr) {
      const hashedToken = this.hashRefreshToken(refreshTokenStr);
      await authRepository.revokeRefreshToken(hashedToken);
    } else {
      await authRepository.revokeAllUserRefreshTokens(userId);
    }

    await authRepository.createAuditLog('LOGOUT', userId, ipAddress, userAgent);
  }
}

export default new AuthService();