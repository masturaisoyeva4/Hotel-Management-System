import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';

import { env } from './config/env';
import { applySecurity } from './config/security';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './config/logger';

// Routes
import authRoutes from './modules/auth/auth.routes';
import hotelsRoutes from './modules/hotels/hotels.routes';
import roomsRoutes from './modules/rooms/rooms.routes';
import bookingsRoutes from './modules/bookings/bookings.routes';
import employeesRoutes from './modules/employees/employees.routes';
import servicesRoutes from './modules/services/services.routes';
import reviewsRoutes from './modules/reviews/reviews.routes';
import invoicesRoutes from './modules/invoices/invoices.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import usersRoutes from './modules/users/users.routes';

const app = express();

// ─── Security (helmet + cors + rate limiting) ────────────
applySecurity(app);

// ─── Body parsing ────────────────────────────────────────
// NOTE: payments/webhook needs raw body — handled in its own router
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ─────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// ─── Health check ────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelsRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users',    usersRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Error Handler ───────────────────────────────────────
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
    logger.info(`📄 Environment: ${env.NODE_ENV}`);
  });
}

export default app;
