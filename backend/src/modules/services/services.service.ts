import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { getPagination, getPaginationMeta } from '../../utils/pagination.utils';
import { CreateServiceDto } from './services.dto';

export class ServicesService {
  async findAll(query: Record<string, string>) {
    const { skip, take, page, limit } = getPagination(query);
    const where: Record<string, unknown> = { isAvailable: true };
    if (query.hotelId) where.hotelId = query.hotelId;
    if (query.category) where.category = query.category;

    const [services, total] = await Promise.all([
      prisma.service.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
      prisma.service.count({ where }),
    ]);

    return { services, meta: getPaginationMeta(total, page, limit) };
  }

  async findOne(id: string) {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) throw new AppError('Service not found', 404);
    return service;
  }

  async create(dto: CreateServiceDto) {
    return prisma.service.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreateServiceDto>) {
    await this.findOne(id);
    return prisma.service.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.findOne(id);
    return prisma.service.update({ where: { id }, data: { isAvailable: false } });
  }

  async findMyBooked(guestId: string) {
    return prisma.bookingService.findMany({
      where: { booking: { guestId } },
      include: {
        service: true,
        booking: {
          select: { id: true, bookingNumber: true, status: true, checkInDate: true, checkOutDate: true },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async addToBooking(bookingId: string, serviceId: string, quantity: number) {
    const service = await this.findOne(serviceId);
    return prisma.bookingService.create({
      data: {
        bookingId,
        serviceId,
        quantity,
        price: Number(service.price) * quantity,
      },
      include: { service: true },
    });
  }
}
