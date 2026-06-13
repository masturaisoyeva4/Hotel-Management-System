import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/database';
import { createTestUser, createTestHotel, createTestRoomType, createTestRoom } from '../../../test/helpers';

describe('Rooms API', () => {
  let adminToken: string;
  let guestToken: string;
  let hotelId: string;
  let roomTypeId: string;
  let ownerId: string;
  let guestId: string;

  beforeAll(async () => {
    const admin = await createTestUser('admin');
    const guest = await createTestUser('guest');
    adminToken = admin.token;
    guestToken = guest.token;
    ownerId = admin.user.id;
    guestId = guest.user.id;

    const hotel = await createTestHotel(ownerId);
    hotelId = hotel.id;

    const roomType = await createTestRoomType(hotelId, 120);
    roomTypeId = roomType.id;
  });

  afterAll(async () => {
    await prisma.room.deleteMany({ where: { hotelId } });
    await prisma.roomType.deleteMany({ where: { hotelId } });
    await prisma.hotel.delete({ where: { id: hotelId } });
    await prisma.user.deleteMany({ where: { id: { in: [ownerId, guestId] } } });
  });

  it('creates a room as admin', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ hotelId, roomNumber: '101', roomTypeId, floor: 1 });

    expect(res.status).toBe(201);
    expect(res.body.data.roomNumber).toBe('101');
    expect(res.body.data.status).toBe('available');
  });

  it('rejects room creation for non-admin', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ hotelId, roomNumber: '102', roomTypeId, floor: 1 });

    expect(res.status).toBe(403);
  });

  it('rejects room creation without auth', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .send({ hotelId, roomNumber: '103', roomTypeId, floor: 1 });

    expect(res.status).toBe(401);
  });

  it('lists rooms with pagination', async () => {
    const res = await request(app).get(`/api/rooms?hotelId=${hotelId}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.data.some((r: { roomNumber: string }) => r.roomNumber === '101')).toBe(true);
  });

  it('fetches a single room by id', async () => {
    const room = await createTestRoom(hotelId, roomTypeId, '201');

    const res = await request(app).get(`/api/rooms/${room.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(room.id);
    expect(res.body.data.roomType).toBeDefined();
  });

  it('returns 404 for a non-existent room', async () => {
    const res = await request(app).get('/api/rooms/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });

  it('updates room status', async () => {
    const room = await createTestRoom(hotelId, roomTypeId, '301');

    const res = await request(app)
      .patch(`/api/rooms/${room.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'maintenance' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('maintenance');
  });

  it('rejects an invalid room status', async () => {
    const room = await createTestRoom(hotelId, roomTypeId, '302');

    const res = await request(app)
      .patch(`/api/rooms/${room.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'not-a-status' });

    expect(res.status).toBe(400);
  });

  it('soft-deletes a room', async () => {
    const room = await createTestRoom(hotelId, roomTypeId, '401');

    const res = await request(app)
      .delete(`/api/rooms/${room.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const updated = await prisma.room.findUnique({ where: { id: room.id } });
    expect(updated?.isActive).toBe(false);
  });

  it('lists available rooms for a date range', async () => {
    const res = await request(app).get(
      `/api/rooms/available?hotelId=${hotelId}&checkInDate=2030-01-01&checkOutDate=2030-01-05`
    );

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('rejects available rooms query when checkout is before checkin', async () => {
    const res = await request(app).get(
      `/api/rooms/available?hotelId=${hotelId}&checkInDate=2030-01-05&checkOutDate=2030-01-01`
    );

    expect(res.status).toBe(400);
  });
});
