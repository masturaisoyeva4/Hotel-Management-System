import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { hashPassword, comparePassword } from '../../utils/hash.utils';
import { UpdateProfileDto, ChangePasswordDto } from './users.dto';
import { getPagination, getPaginationMeta } from '../../utils/pagination.utils';

export class UsersService {
  // ── GET all users (admin only) ─────────────────────────
  async findAll(query: Record<string, string>) {
    const { skip, take, page, limit } = getPagination(query);
    const where: Record<string, unknown> = {};
    if (query.role)   where.role     = query.role;
    if (query.search) {
      where.OR = [
        { email:     { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName:  { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true, firstName: true, lastName: true,
          email: true, phone: true, role: true,
          avatarUrl: true, isActive: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, meta: getPaginationMeta(total, page, limit) };
  }

  // ── GET one user ───────────────────────────────────────
  async findOne(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, firstName: true, lastName: true,
        email: true, phone: true, role: true,
        avatarUrl: true, isActive: true, createdAt: true,
      },
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  // ── UPDATE own profile ────────────────────────────────
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName:  dto.lastName,
        phone:     dto.phone || null,
      },
      select: {
        id: true, firstName: true, lastName: true,
        email: true, phone: true, role: true, avatarUrl: true,
      },
    });
  }

  // ── CHANGE password ───────────────────────────────────
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const valid = await comparePassword(dto.currentPassword, user.passwordHash);
    if (!valid) throw new AppError('Current password is incorrect', 400);

    const passwordHash = await hashPassword(dto.newPassword);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  // ── TOGGLE active (admin) ─────────────────────────────
  async toggleActive(id: string) {
    const user = await this.findOne(id);
    return prisma.user.update({
      where: { id },
      data: { isActive: !(user as { isActive: boolean }).isActive },
      select: { id: true, isActive: true },
    });
  }
}
