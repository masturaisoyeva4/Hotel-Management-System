import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/database';
import { createTestUser, createTestHotel } from '../../../test/helpers';

describe('Services API', () => {
  let adminToken: string;
  let adminId: string;
  let guestToken: string;
  let guestId: string;
  let hotelId: string;
  let serviceId: string;

  beforeAll(async () => {
    const admin = await createTestUser('admin');
    const guest = await createTestUser('guest');
    adminToken = admin.token;
    adminId = admin.user.id;
    guestToken = guest.token;
    guestId = guest.user.id;

    const hotel = await createTestHotel(adminId);
    hotelId = hotel.id;
  });

  afterAll(async () => {
    await prisma.service.deleteMany({ where: { hotelId } });
    await prisma.hotel.delete({ where: { id: hotelId } });
    await prisma.user.deleteMany({ where: { id: { in: [adminId, guestId] } } });
  });

  it('rejects service creation for non-admin', async () => {
    const res = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ hotelId, name: 'Breakfast', category: 'restaurant', price: 15 });

    expect(res.status).toBe(403);
  });

  it('creates a service as admin', async () => {
    const res = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ hotelId, name: 'Breakfast', category: 'restaurant', price: 15 });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Breakfast');
    expect(res.body.data.isAvailable).toBe(true);
    serviceId = res.body.data.id;
  });

  it('rejects an invalid category', async () => {
    const res = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ hotelId, name: 'Mystery', category: 'unknown', price: 10 });

    expect(res.status).toBe(400);
  });

  it('lists services publicly', async () => {
    const res = await request(app).get(`/api/services?hotelId=${hotelId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.some((s: { id: string }) => s.id === serviceId)).toBe(true);
  });

  it('updates a service', async () => {
    const res = await request(app)
      .put(`/api/services/${serviceId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 20 });

    expect(res.status).toBe(200);
    expect(Number(res.body.data.price)).toBe(20);
  });

  it('soft-deletes a service (marks unavailable)', async () => {
    const res = await request(app)
      .delete(`/api/services/${serviceId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const deleted = await prisma.service.findUnique({ where: { id: serviceId } });
    expect(deleted?.isAvailable).toBe(false);
  });
});
