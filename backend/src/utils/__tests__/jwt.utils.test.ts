import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  JwtPayload,
} from '../jwt.utils';

describe('jwt.utils', () => {
  const payload: JwtPayload = {
    userId: '123',
    email: 'guest@example.com',
    role: 'guest',
  };

  it('generates and verifies an access token', () => {
    const token = generateAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it('generates and verifies a refresh token', () => {
    const token = generateRefreshToken(payload);
    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe(payload.userId);
  });

  it('throws when verifying an access token with the refresh secret', () => {
    const token = generateAccessToken(payload);
    expect(() => verifyRefreshToken(token)).toThrow();
  });

  it('throws on a malformed token', () => {
    expect(() => verifyAccessToken('not.a.token')).toThrow();
  });
});
