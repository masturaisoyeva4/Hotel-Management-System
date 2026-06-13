import { prisma } from '../config/database';
import { hashPassword } from '../utils/hash.utils';
import { generateAccessToken } from '../utils/jwt.utils';
import { Role } from '@prisma/client';

let counter = 0;
const unique = () => `${Date.now()}-${process.pid}-${counter++}`;

export async function createTestUser(role: Role = 'guest') {
  const id = unique();
  const user = await prisma.user.create({
    data: {
      firstName: 'Test',
      lastName: role,
      email: `test-${role}-${id}@example.com`,
      passwordHash: await hashPassword('Password123'),
      role,
      isActive: true,
    },
  });

  const token = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  return { user, token };
}

export async function createTestHotel(ownerId: string) {
  return prisma.hotel.create({
    data: {
      name: `Test Hotel ${unique()}`,
      address: '123 Test St',
      city: 'Tashkent',
      country: 'Uzbekistan',
      ownerId,
    },
  });
}

export async function createTestRoomType(hotelId: string, basePrice = 100) {
  return prisma.roomType.create({
    data: {
      hotelId,
      name: `Standard ${unique()}`,
      capacity: 2,
      basePrice,
      amenities: ['WiFi'],
    },
  });
}

export async function createTestRoom(hotelId: string, roomTypeId: string, roomNumber?: string) {
  return prisma.room.create({
    data: {
      hotelId,
      roomTypeId,
      roomNumber: roomNumber || unique().slice(-8),
      floor: 1,
    },
  });
}

export async function createTestBooking(opts: {
  guestId: string;
  hotelId: string;
  roomId: string;
  status?: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  totalPrice?: number;
}) {
  const checkInDate = new Date();
  const checkOutDate = new Date();
  checkOutDate.setDate(checkOutDate.getDate() + 2);

  return prisma.booking.create({
    data: {
      bookingNumber: `BK${Date.now().toString(36).toUpperCase()}${(counter++).toString(36)}`,
      guestId: opts.guestId,
      hotelId: opts.hotelId,
      roomId: opts.roomId,
      checkInDate,
      checkOutDate,
      totalPrice: opts.totalPrice ?? 200,
      status: opts.status ?? 'pending',
    },
  });
}
