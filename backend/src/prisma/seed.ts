import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin (only login account)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hotel.com' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@hotel.com',
      passwordHash: await bcrypt.hash('admin123', 12),
      role: 'super_admin',
      isActive: true,
    },
  });

  // Hotel
  const hotel = await prisma.hotel.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Grand Tashkent Hotel',
      description: 'Toshkentning markazida joylashgan 5 yulduzli mehmonxona',
      address: 'Amir Temur ko\'chasi 1',
      city: 'Tashkent',
      country: 'Uzbekistan',
      phone: '+998712345678',
      email: 'info@grandtashkent.com',
      starRating: 5,
      ownerId: admin.id,
    },
  });

  // Room Types
  const standardType = await prisma.roomType.create({
    data: {
      hotelId: hotel.id,
      name: 'Standard',
      description: 'Qulay standart xona',
      capacity: 2,
      basePrice: 80,
      amenities: ['WiFi', 'TV', 'Air conditioning', 'Mini fridge'],
    },
  });

  const deluxeType = await prisma.roomType.create({
    data: {
      hotelId: hotel.id,
      name: 'Deluxe',
      description: 'Keng va zamonaviy deluxe xona',
      capacity: 2,
      basePrice: 150,
      amenities: ['WiFi', 'TV', 'Air conditioning', 'Mini bar', 'Bathtub', 'City view'],
    },
  });

  const suiteType = await prisma.roomType.create({
    data: {
      hotelId: hotel.id,
      name: 'Suite',
      description: 'Hashamatli suite xona',
      capacity: 4,
      basePrice: 300,
      amenities: ['WiFi', 'TV', 'Air conditioning', 'Full bar', 'Jacuzzi', 'Living room', 'Panoramic view'],
    },
  });

  // Rooms
  await prisma.room.createMany({
    data: [
      { hotelId: hotel.id, roomNumber: '101', roomTypeId: standardType.id, floor: 1 },
      { hotelId: hotel.id, roomNumber: '102', roomTypeId: standardType.id, floor: 1 },
      { hotelId: hotel.id, roomNumber: '201', roomTypeId: deluxeType.id, floor: 2 },
      { hotelId: hotel.id, roomNumber: '202', roomTypeId: deluxeType.id, floor: 2 },
      { hotelId: hotel.id, roomNumber: '301', roomTypeId: suiteType.id, floor: 3 },
    ],
    skipDuplicates: true,
  });

  // Services
  await prisma.service.createMany({
    data: [
      { hotelId: hotel.id, name: 'Breakfast', category: 'restaurant', price: 15, description: 'Full English breakfast' },
      { hotelId: hotel.id, name: 'Spa Session', category: 'spa', price: 50, description: '60 min relaxation massage' },
      { hotelId: hotel.id, name: 'Airport Transfer', category: 'transport', price: 30, description: 'Round trip airport pickup' },
      { hotelId: hotel.id, name: 'Laundry', category: 'laundry', price: 10, description: 'Per kg' },
      { hotelId: hotel.id, name: 'Room Service', category: 'restaurant', price: 5, description: 'Delivery fee' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed completed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Admin: admin@hotel.com / admin123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
