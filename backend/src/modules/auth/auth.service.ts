import { prisma } from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/hash.utils';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.utils';
import { AppError } from '../../middleware/error.middleware';
import { RegisterDto, LoginDto } from './auth.dto';

export class AuthService {
  async register(dto: RegisterDto) {
    const email = dto.email || `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@mehmonxona.local`;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already registered', 409);

    const passwordHash = await hashPassword(dto.password);

    const user = await prisma.user.create({
      data: {
        firstName: dto.firstName?.trim() || 'Mehmon',
        lastName: dto.lastName?.trim() || '',
        email,
        passwordHash,
        phone: dto.phone || undefined,
        role: 'guest',
      },
      select: {
        id: true, firstName: true, lastName: true,
        email: true, phone: true, role: true, createdAt: true,
      },
    });

    const tokens = this.generateTokens(user.id, user.email, user.role);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.isActive) throw new AppError('Invalid credentials', 401);

    const valid = await comparePassword(dto.password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const tokens = this.generateTokens(user.id, user.email, user.role);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    const { passwordHash, refreshToken, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  }

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async refreshTokens(token: string) {
    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token', 401);
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return tokens;
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, firstName: true, lastName: true,
        email: true, phone: true, role: true,
        avatarUrl: true, isActive: true, createdAt: true,
      },
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  private generateTokens(userId: string, email: string, role: string) {
    const payload = { userId, email, role };
    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }
}
