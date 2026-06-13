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

describe('Reviews API', () => {
  let adminToken: string;
  let adminId: string;
  let guestToken: string;
  let guestId: string;
  let hotelId: string;
  let roomId: string;
  let checkedOutBookingId: string;
  let pendingBookingId: string;
  let reviewId: string;

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
    const room = await createTestRoom(hotelId, roomType.id, 'REV101');
    roomId = room.id;

    const checkedOutBooking = await createTestBooking({ guestId, hotelId, roomId, status: 'checked_out' });
    checkedOutBookingId = checkedOutBooking.id;

    const pendingBooking = await createTestBooking({ guestId, hotelId, roomId, status: 'pending' });
    pendingBookingId = pendingBooking.id;
  });

  afterAll(async () => {
    await prisma.review.deleteMany({ where: { hotelId } });
    await prisma.booking.deleteMany({ where: { hotelId } });
    await prisma.room.deleteMany({ where: { hotelId } });
    await prisma.roomType.deleteMany({ where: { hotelId } });
    await prisma.hotel.delete({ where: { id: hotelId } });
    await prisma.user.deleteMany({ where: { id: { in: [adminId, guestId] } } });
  });

  it('rejects a review for a non-completed stay', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: pendingBookingId, hotelId, rating: 5,
        cleanlinessRating: 5, serviceRating: 5, comfortRating: 5,
        comment: 'Great stay overall!',
      });

    expect(res.status).toBe(400);
  });

  it('creates a review for a checked-out stay', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: checkedOutBookingId, hotelId, rating: 5,
        cleanlinessRating: 4, serviceRating: 5, comfortRating: 5,
        comment: 'Great stay overall!',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.isApproved).toBe(false);
    reviewId = res.body.data.id;
  });

  it('rejects a duplicate review for the same booking', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: checkedOutBookingId, hotelId, rating: 4,
        cleanlinessRating: 4, serviceRating: 4, comfortRating: 4,
        comment: 'Second attempt review here.',
      });

    expect(res.status).toBe(409);
  });

  it('does not list unapproved reviews publicly', async () => {
    const res = await request(app).get(`/api/reviews?hotelId=${hotelId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.some((r: { id: string }) => r.id === reviewId)).toBe(false);
  });

  it('rejects approval for non-admin', async () => {
    const res = await request(app)
      .put(`/api/reviews/${reviewId}/approve`)
      .set('Authorization', `Bearer ${guestToken}`);

    expect(res.status).toBe(403);
  });

  it('approves a review as admin', async () => {
    const res = await request(app)
      .put(`/api/reviews/${reviewId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isApproved).toBe(true);
  });

  it('lists the approved review publicly', async () => {
    const res = await request(app).get(`/api/reviews?hotelId=${hotelId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.some((r: { id: string }) => r.id === reviewId)).toBe(true);
  });

  it('rejects review deletion for non-admin', async () => {
    const res = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${guestToken}`);

    expect(res.status).toBe(403);
  });

  it('deletes a review as admin', async () => {
    const res = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const deleted = await prisma.review.findUnique({ where: { id: reviewId } });
    expect(deleted).toBeNull();
  });
});
