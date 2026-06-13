import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/database';
import {
  createTestUser,
  createTestHotel,
  createTestRoomType,
  createTestRoom,
  createTestBooking,
} from '../../../test/helpers';

describe('Analytics API', () => {
  let adminToken: string;
  let adminId: string;
  let guestToken: string;
  let guestId: string;
  let hotelId: string;
  let roomId: string;
  let invoiceId: string;

  beforeAll(async () => {
    const admin = await createTestUser('admin');
    const guest = await createTestUser('guest');
    adminToken = admin.token;
    adminId = admin.user.id;
    guestToken = guest.token;
    guestId = guest.user.id;

    const hotel = await createTestHotel(adminId);
    hotelId = hotel.id;

    const roomType = await createTestRoomType(hotelId, 100);
    const room = await createTestRoom(hotelId, roomType.id, 'ANL101');
    roomId = room.id;

    const booking = await createTestBooking({ guestId, hotelId, roomId, status: 'checked_out', totalPrice: 200 });

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INVANL${Date.now().toString(36).toUpperCase()}`,
        bookingId: booking.id,
        guestId,
        hotelId,
        subtotal: 200,
        taxAmount: 24,
        totalAmount: 224,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        paidAt: new Date(),
      },
    });
    invoiceId = invoice.id;
  });

  afterAll(async () => {
    await prisma.invoice.delete({ where: { id: invoiceId } }).catch(() => {});
    await prisma.booking.deleteMany({ where: { hotelId } });
    await prisma.room.deleteMany({ where: { hotelId } });
    await prisma.roomType.deleteMany({ where: { hotelId } });
    await prisma.hotel.delete({ where: { id: hotelId } });
    await prisma.user.deleteMany({ where: { id: { in: [adminId, guestId] } } });
  });

  it('rejects analytics access for guests', async () => {
    const res = await request(app)
      .get('/api/analytics/overview')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(res.status).toBe(403);
  });

  it('rejects analytics access without auth', async () => {
    const res = await request(app).get('/api/analytics/overview');
    expect(res.status).toBe(401);
  });

  it('returns analytics overview for admin', async () => {
    const res = await request(app)
      .get(`/api/analytics/overview?hotelId=${hotelId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalBookings).toBeGreaterThanOrEqual(1);
    expect(Number(res.body.data.totalRevenue)).toBeGreaterThanOrEqual(224);
    expect(res.body.data.totalRooms).toBeGreaterThanOrEqual(1);
    expect(typeof res.body.data.occupancyRate).toBe('number');
  });

  it('returns the revenue chart for admin', async () => {
    const res = await request(app)
      .get(`/api/analytics/revenue?hotelId=${hotelId}&months=12`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    const currentMonth = new Date().toISOString().slice(0, 7);
    const entry = res.body.data.find((d: { month: string }) => d.month === currentMonth);
    expect(entry).toBeDefined();
    expect(Number(entry.revenue)).toBeGreaterThanOrEqual(224);
  });

  it('returns the top rooms for admin', async () => {
    const res = await request(app)
      .get(`/api/analytics/top-rooms?hotelId=${hotelId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((r: { roomId: string }) => r.roomId === roomId)).toBe(true);
  });
});
