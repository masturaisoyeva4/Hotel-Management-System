import { Request, Response } from 'express';
import { z } from 'zod';
import { AppError, errorHandler } from '../error.middleware';

const createMockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const req = { originalUrl: '/api/test', method: 'GET' } as Request;
const next = jest.fn();

describe('error.middleware', () => {
  it('handles ZodError as 400 with field errors', () => {
    const res = createMockRes();
    const schema = z.object({ email: z.string().email() });
    const result = schema.safeParse({ email: 'not-an-email' });

    errorHandler(result.error as unknown as Error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Validation error' })
    );
  });

  it('handles AppError with its own status code', () => {
    const res = createMockRes();
    errorHandler(new AppError('Email already registered', 409), req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Email already registered',
    });
  });

  it('handles JsonWebTokenError as 401', () => {
    const res = createMockRes();
    const err = new Error('jwt malformed');
    err.name = 'JsonWebTokenError';

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid token' });
  });

  it('falls back to 500 for unknown errors', () => {
    const res = createMockRes();
    errorHandler(new Error('boom'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
