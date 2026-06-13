import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/database';

const testEmail = `auth-test-${Date.now()}@example.com`;
const testPassword = 'Password123';

describe('Auth API', () => {
  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  it('registers a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      password: testPassword,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.user.role).toBe('guest');
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('rejects registration with a weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      email: `weak-${Date.now()}@example.com`,
      password: 'weak',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects duplicate email registration', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      password: testPassword,
    });

    expect(res.status).toBe(409);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: testPassword,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(testEmail);
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'WrongPassword1',
    });

    expect(res.status).toBe(401);
  });

  it('returns the current user for /me with a valid token', async () => {
    const login = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: testPassword,
    });
    const { accessToken } = login.body.data;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(testEmail);
  });

  it('rejects /me without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('refreshes tokens with a valid refresh token', async () => {
    const login = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: testPassword,
    });
    const { refreshToken } = login.body.data;

    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('logs out and invalidates the refresh token', async () => {
    const login = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: testPassword,
    });
    const { accessToken, refreshToken } = login.body.data;

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(logoutRes.status).toBe(200);

    const refreshRes = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(refreshRes.status).toBe(401);
  });
});
