import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { getPagination, getPaginationMeta } from '../../utils/pagination.utils';
import { CreateHotelDto, UpdateHotelDto } from './hotels.dto';

export class HotelsService {
  async findAll(query: { page?: number; limit?: number; city?: string; country?: string; stars?: number }) {
    const { skip, take, page, limit } = getPagination(query);

    const where: Record<string, unknown> = { isActive: true };
    if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
    if (query.country) where.country = { contains: query.country, mode: 'insensitive' };
    if (query.stars) where.starRating = Number(query.stars);

    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({
        where,
        skip,
        take,
        include: {
          _count: { select: { rooms: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.hotel.count({ where }),
    ]);

    return { hotels, meta: getPaginationMeta(total, page, limit) };
  }

  async findOne(id: string) {
    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        roomTypes: true,
        services: { where: { isAvailable: true } },
        reviews: {
          where: { isApproved: true },
          include: { guest: { select: { firstName: true, lastName: true, avatarUrl: true } } },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { rooms: true, reviews: true } },
      },
    });

    if (!hotel) throw new AppError('Hotel not found', 404);
    return hotel;
  }

  async create(dto: CreateHotelDto, ownerId: string) {
    return prisma.hotel.create({
      data: { ...dto, ownerId },
    });
  }

  async update(id: string, dto: UpdateHotelDto) {
    await this.findOne(id);
    return prisma.hotel.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.findOne(id);
    return prisma.hotel.update({ where: { id }, data: { isActive: false } });
  }
}
