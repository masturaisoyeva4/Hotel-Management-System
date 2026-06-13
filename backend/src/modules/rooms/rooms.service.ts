import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { getPagination, getPaginationMeta } from '../../utils/pagination.utils';
import { CreateRoomDto } from './rooms.dto';

export class RoomsService {
  async findAll(query: Record<string, string>) {
    const { skip, take, page, limit } = getPagination(query);
    const where: Record<string, unknown> = { isActive: true };
    if (query.hotelId) where.hotelId = query.hotelId;
    if (query.status) where.status = query.status;

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take,
        include: { roomType: true },
        orderBy: { roomNumber: 'asc' },
      }),
      prisma.room.count({ where }),
    ]);

    return { rooms, meta: getPaginationMeta(total, page, limit) };
  }

  async findOne(id: string) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: { roomType: true, hotel: true },
    });
    if (!room) throw new AppError('Room not found', 404);
    return room;
  }

  async findAvailable(hotelId: string, checkIn: string, checkOut: string, roomTypeId?: string) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      throw new AppError('Check-out must be after check-in', 400);
    }

    const where: Record<string, unknown> = {
      hotelId,
      status: 'available',
      isActive: true,
      bookings: {
        none: {
          status: { in: ['pending', 'confirmed', 'checked_in'] },
          OR: [
            { checkInDate: { lt: checkOutDate }, checkOutDate: { gt: checkInDate } },
          ],
        },
      },
    };

    if (roomTypeId) where.roomTypeId = roomTypeId;

    return prisma.room.findMany({
      where,
      include: { roomType: true },
    });
  }

  async getBookedDates(hotelId: string) {
    const bookings = await prisma.booking.findMany({
      where: {
        hotelId,
        status: { in: ['pending', 'confirmed', 'checked_in'] },
        checkOutDate: { gte: new Date() },
      },
      select: { roomId: true, checkInDate: true, checkOutDate: true },
      orderBy: { checkInDate: 'asc' },
    });

    const byRoom: Record<string, { checkInDate: Date; checkOutDate: Date }[]> = {};
    for (const b of bookings) {
      if (!byRoom[b.roomId]) byRoom[b.roomId] = [];
      byRoom[b.roomId].push({ checkInDate: b.checkInDate, checkOutDate: b.checkOutDate });
    }
    return byRoom;
  }

  async create(dto: CreateRoomDto) {
    return prisma.room.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreateRoomDto>) {
    await this.findOne(id);
    return prisma.room.update({ where: { id }, data: dto });
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);
    return prisma.room.update({
      where: { id },
      data: { status: status as 'available' | 'occupied' | 'maintenance' | 'cleaning' },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return prisma.room.update({ where: { id }, data: { isActive: false } });
  }
}
