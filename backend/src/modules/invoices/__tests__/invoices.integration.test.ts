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

describe('Invoices API', () => {
  let adminToken: string;
  let adminId: string;
  let guestToken: string;
  let guestId: string;
  let hotelId: string;
  let roomId: string;
  let bookingId: string;
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

    const roomType = await createTestRoomType(hotelId, 150);
    const room = await createTestRoom(hotelId, roomType.id, 'INV101');
    roomId = room.id;

    const booking = await createTestBooking({
      guestId, hotelId, roomId, status: 'checked_out', totalPrice: 300,
    });
    bookingId = booking.id;
  });

  afterAll(async () => {
    await prisma.invoice.deleteMany({ where: { hotelId } });
    await prisma.booking.deleteMany({ where: { hotelId } });
    await prisma.room.deleteMany({ where: { hotelId } });
    await prisma.roomType.deleteMany({ where: { hotelId } });
    await prisma.hotel.delete({ where: { id: hotelId } });
    await prisma.user.deleteMany({ where: { id: { in: [adminId, guestId] } } });
  });

  it('rejects invoice generation for non-staff', async () => {
    const res = await request(app)
      .post('/api/invoices/generate')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ bookingId, paymentMethod: 'cash' });

    expect(res.status).toBe(403);
  });

  it('generates an invoice for a booking', async () => {
    const res = await request(app)
      .post('/api/invoices/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ bookingId, paymentMethod: 'cash' });

    expect(res.status).toBe(201);
    expect(Number(res.body.data.subtotal)).toBe(300);
    expect(Number(res.body.data.taxAmount)).toBeCloseTo(36); // 12% of 300
    expect(Number(res.body.data.totalAmount)).toBeCloseTo(336);
    expect(res.body.data.paymentStatus).toBe('pending');
    invoiceId = res.body.data.id;
  });

  it('returns the existing invoice when generated again', async () => {
    const res = await request(app)
      .post('/api/invoices/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ bookingId, paymentMethod: 'cash' });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe(invoiceId);
  });

  it('rejects invoice generation with invalid payment method', async () => {
    const res = await request(app)
      .post('/api/invoices/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ bookingId, paymentMethod: 'crypto' });

    expect(res.status).toBe(400);
  });

  it('lists invoices for admin', async () => {
    const res = await request(app)
      .get(`/api/invoices?hotelId=${hotelId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.some((inv: { id: string }) => inv.id === invoiceId)).toBe(true);
  });

  it('rejects invoice listing for guests', async () => {
    const res = await request(app)
      .get('/api/invoices')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(res.status).toBe(403);
  });

  it('fetches a single invoice with full details', async () => {
    const res = await request(app)
      .get(`/api/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.booking.bookingNumber).toBeDefined();
    expect(res.body.data.hotel.id).toBe(hotelId);
  });

  it('returns 404 for a non-existent invoice', async () => {
    const res = await request(app)
      .get('/api/invoices/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
