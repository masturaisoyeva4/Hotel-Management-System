import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/database';
import { createTestUser, createTestHotel, createTestRoomType, createTestRoom } from '../../../test/helpers';

describe('Bookings API', () => {
  let guestToken: string;
  let guestId: string;
  let otherGuestId: string;
  let otherGuestToken: string;
  let adminToken: string;
  let adminId: string;
  let hotelId: string;
  let roomId: string;
  let ownerId: string;

  const checkInDate = '2030-02-01';
  const checkOutDate = '2030-02-03';

  beforeAll(async () => {
    const admin = await createTestUser('admin');
    const guest = await createTestUser('guest');
    const otherGuest = await createTestUser('guest');
    adminToken = admin.token;
    adminId = admin.user.id;
    guestToken = guest.token;
    guestId = guest.user.id;
    otherGuestToken = otherGuest.token;
    otherGuestId = otherGuest.user.id;
    ownerId = admin.user.id;

    const hotel = await createTestHotel(ownerId);
    hotelId = hotel.id;

    const roomType = await createTestRoomType(hotelId, 100);
    const room = await createTestRoom(hotelId, roomType.id, 'B101');
    roomId = room.id;
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { hotelId } });
    await prisma.room.deleteMany({ where: { hotelId } });
    await prisma.roomType.deleteMany({ where: { hotelId } });
    await prisma.hotel.delete({ where: { id: hotelId } });
    await prisma.user.deleteMany({ where: { id: { in: [adminId, guestId, otherGuestId] } } });
  });

  it('rejects booking creation without auth', async () => {
    const res = await request(app).post('/api/bookings').send({
      roomId, hotelId, checkInDate, checkOutDate,
    });
    expect(res.status).toBe(401);
  });

  it('rejects booking creation for non-guest roles', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ roomId, hotelId, checkInDate, checkOutDate });

    expect(res.status).toBe(403);
  });

  let bookingId: string;

  it('creates a booking as a guest', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ roomId, hotelId, checkInDate, checkOutDate, adults: 2, children: 0 });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
    expect(Number(res.body.data.totalPrice)).toBe(200); // 2 nights * 100
    bookingId = res.body.data.id;
  });

  it('rejects overlapping booking for the same room', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ roomId, hotelId, checkInDate, checkOutDate, adults: 1, children: 0 });

    expect(res.status).toBe(409);
  });

  it('rejects checkout date before checkin date', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ roomId, hotelId, checkInDate: '2030-03-05', checkOutDate: '2030-03-01' });

    expect(res.status).toBe(400);
  });

  it('lets the guest fetch their own booking', async () => {
    const res = await request(app)
      .get(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${guestToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(bookingId);
  });

  it('lists only own bookings for a guest', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every((b: { guestId: string }) => b.guestId === guestId)).toBe(true);
  });

  it('rejects another guest cancelling someone else\'s booking', async () => {
    const res = await request(app)
      .put(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${otherGuestToken}`);

    expect(res.status).toBe(403);
  });

  it('confirms the booking as admin', async () => {
    const res = await request(app)
      .put(`/api/bookings/${bookingId}/confirm`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('confirmed');
  });

  it('rejects an invalid status transition', async () => {
    const res = await request(app)
      .put(`/api/bookings/${bookingId}/checkout`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });

  it('checks the guest in', async () => {
    const res = await request(app)
      .put(`/api/bookings/${bookingId}/checkin`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('checked_in');
  });

  it('checks the guest out', async () => {
    const res = await request(app)
      .put(`/api/bookings/${bookingId}/checkout`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('checked_out');
  });

  it('rejects cancelling a checked-out booking', async () => {
    const res = await request(app)
      .put(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);

    expect(res.status).toBe(400);
  });
});
