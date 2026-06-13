import { Router } from 'express';
import { BookingsController } from './bookings.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createBookingDto, updateBookingDto, bookingQueryDto } from './bookings.dto';

const router = Router();
const ctrl = new BookingsController();

// All booking routes require authentication
router.use(authenticate);

// GET — admin sees all, guest sees own (filtered in service)
router.get('/', validate(bookingQueryDto, 'query'), ctrl.getAll);
router.get('/:id', ctrl.getOne);

// Create booking — guests only
router.post(
  '/',
  authorize('guest'),
  validate(createBookingDto),
  ctrl.create
);

// Update special requests / guests count — guest or admin
router.patch(
  '/:id',
  validate(updateBookingDto),
  ctrl.update
);

// Status transitions — staff only
router.put(
  '/:id/confirm',
  authorize('super_admin', 'admin', 'receptionist'),
  ctrl.confirm
);
router.put(
  '/:id/checkin',
  authorize('super_admin', 'admin', 'receptionist'),
  ctrl.checkIn
);
router.put(
  '/:id/checkout',
  authorize('super_admin', 'admin', 'receptionist'),
  ctrl.checkOut
);

// Cancel — any authenticated user (ownership checked in service)
router.put('/:id/cancel', ctrl.cancel);

export default router;
