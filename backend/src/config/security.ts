import { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './env';

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many auth attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
});

// General API limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
});

export const applySecurity = (app: Express): void => {
  // HTTP headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS — supports a comma-separated list of allowed origins
  const allowedOrigins = env.FRONTEND_URL.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Global rate limiter
  app.use('/api', apiLimiter);
};
