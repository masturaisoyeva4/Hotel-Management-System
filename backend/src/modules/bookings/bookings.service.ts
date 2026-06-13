import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { getPagination, getPaginationMeta } from '../../utils/pagination.utils';
import { CreateBookingDto, UpdateBookingDto, BookingQueryDto } from './bookings.dto';

// ─── Helpers ─────────────────────────────────────────────

const generateBookingNumber = (): string => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK${ts}${rand}`;
};

const calcNights = (checkIn: Date, checkOut: Date): number =>
  Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

// ─── Allowed status transitions ───────────────────────────

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending:     ['confirmed', 'cancelled'],
  confirmed:   ['checked_in', 'cancelled'],
  checked_in:  ['checked_out'],
  checked_out: [],
  cancelled:   [],
};

// ─── Service ─────────────────────────────────────────────

export class BookingsService {
  async findAll(query: BookingQueryDto, userId: string, role: string) {
    const { skip, take, page, limit } = getPagination(query);
    const where: Record<string, unknown> = {};

    // Guests can only see their own bookings
    if (role === 'guest') where.guestId = userId;
    if (query.hotelId) where.hotelId = query.hotelId;
    if (query.status) where.status = query.status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take,
        include: {
          room: { include: { roomType: true } },
          hotel: { select: { name: true, city: true } },
          guest: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.booking.count({ where }),
    ]);

    return { bookings, meta: getPaginationMeta(total, page, limit) };
  }

  async findOne(id: string) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: { include: { roomType: true } },
        hotel: true,
        guest: { select: { firstName: true, lastName: true, email: true, phone: true } },
        bookingServices: { include: { service: true } },
        invoice: true,
        review: true,
      },
    });
    if (!booking) throw new AppError('Booking not found', 404);
    return booking;
  }

  async create(dto: CreateBookingDto, guestId: string) {
    const checkIn = new Date(dto.checkInDate);
    const checkOut = new Date(dto.checkOutDate);

    // Check room exists and is active
    const room = await prisma.room.findUnique({
      where: { id: dto.roomId },
      include: { roomType: true },
    });
    if (!room || !room.isActive) throw new AppError('Room not found', 404);
    if (room.status !== 'available') {
      throw new AppError('Room is currently not available', 409);
    }

    // Overlap check
    const conflict = await prisma.booking.findFirst({
      where: {
        roomId: dto.roomId,
        status: { in: ['pending', 'confirmed', 'checked_in'] },
        checkInDate: { lt: checkOut },
        checkOutDate: { gt: checkIn },
      },
    });
    if (conflict) {
      throw new AppError('Room is already booked for the selected dates', 409);
    }

    const nights = calcNights(checkIn, checkOut);
    const totalPrice = Number(room.roomType.basePrice) * nights;

    return prisma.booking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        guestId,
        roomId: dto.roomId,
        hotelId: dto.hotelId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults: dto.adults,
        children: dto.children,
        specialRequests: dto.specialRequests,
        totalPrice,
        status: 'pending',
      },
      include: {
        room: { include: { roomType: true } },
        hotel: { select: { name: true, city: true } },
      },
    });
  }

  async update(id: string, dto: UpdateBookingDto, userId: string, role: string) {
    const booking = await this.findOne(id);

    if (role === 'guest' && booking.guestId !== userId) {
      throw new AppError('Access denied', 403);
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      throw new AppError('Booking cannot be modified in its current state', 400);
    }

    return prisma.booking.update({ where: { id }, data: dto });
  }

  async transition(id: string, action: 'confirm' | 'checkin' | 'checkout' | 'cancel') {
    const booking = await this.findOne(id);

    const statusMap: Record<string, string> = {
      confirm: 'confirmed',
      checkin: 'checked_in',
      checkout: 'checked_out',
      cancel: 'cancelled',
    };

    const newStatus = statusMap[action];
    const allowed = STATUS_TRANSITIONS[booking.status];

    if (!allowed.includes(newStatus)) {
      throw new AppError(
        `Cannot transition from '${booking.status}' to '${newStatus}'`,
        400
      );
    }

    return prisma.booking.update({
      where: { id },
      data: {
        status: newStatus as 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled',
      },
    });
  }

  async cancel(id: string, userId: string, role: string) {
    const booking = await this.findOne(id);

    if (role === 'guest' && booking.guestId !== userId) {
      throw new AppError('You can only cancel your own bookings', 403);
    }

    return this.transition(id, 'cancel');
  }
}
