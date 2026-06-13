import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { getPagination, getPaginationMeta } from '../../utils/pagination.utils';
import { CreateReviewDto } from './reviews.dto';

export class ReviewsService {
  async findAll(query: Record<string, string>) {
    const { skip, take, page, limit } = getPagination(query);
    const where: Record<string, unknown> = { isApproved: true };
    if (query.hotelId) where.hotelId = query.hotelId;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take,
        include: {
          guest: { select: { firstName: true, lastName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where }),
    ]);

    return { reviews, meta: getPaginationMeta(total, page, limit) };
  }

  async findOne(id: string) {
    const review = await prisma.review.findUnique({
      where: { id },
      include: { guest: { select: { firstName: true, lastName: true } } },
    });
    if (!review) throw new AppError('Review not found', 404);
    return review;
  }

  async create(dto: CreateReviewDto, guestId: string) {
    // Check booking exists and belongs to guest
    const booking = await prisma.booking.findFirst({
      where: { id: dto.bookingId, guestId, status: 'checked_out' },
    });
    if (!booking) throw new AppError('You can only review completed stays', 400);

    // Prevent duplicate reviews
    const existing = await prisma.review.findUnique({ where: { bookingId: dto.bookingId } });
    if (existing) throw new AppError('You have already reviewed this stay', 409);

    return prisma.review.create({ data: { ...dto, guestId } });
  }

  async approve(id: string) {
    await this.findOne(id);
    return prisma.review.update({ where: { id }, data: { isApproved: true } });
  }

  async delete(id: string) {
    await this.findOne(id);
    return prisma.review.delete({ where: { id } });
  }
}
