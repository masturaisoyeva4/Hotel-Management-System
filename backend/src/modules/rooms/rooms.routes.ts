import { Router } from 'express';
import { RoomsController } from './rooms.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createRoomDto,
  updateRoomDto,
  updateRoomStatusDto,
  roomAvailabilityDto,
  roomBookedDatesDto,
  roomQueryDto,
} from './rooms.dto';

const router = Router();
const ctrl = new RoomsController();

// Public
router.get('/', validate(roomQueryDto, 'query'), ctrl.getAll);
router.get('/available', validate(roomAvailabilityDto, 'query'), ctrl.getAvailable);
router.get('/booked-dates', validate(roomBookedDatesDto, 'query'), ctrl.getBookedDates);
router.get('/:id', ctrl.getOne);

// Protected
router.post(
  '/',
  authenticate,
  authorize('super_admin', 'admin'),
  validate(createRoomDto),
  ctrl.create
);

router.patch(
  '/:id',
  authenticate,
  authorize('super_admin', 'admin'),
  validate(updateRoomDto),
  ctrl.update
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('super_admin', 'admin', 'receptionist', 'housekeeper'),
  validate(updateRoomStatusDto),
  ctrl.updateStatus
);

router.delete(
  '/:id',
  authenticate,
  authorize('super_admin', 'admin'),
  ctrl.delete
);

export default router;
