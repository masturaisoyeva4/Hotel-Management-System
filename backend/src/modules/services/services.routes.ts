import { Router } from 'express';
import { ServicesController } from './services.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createServiceDto, updateServiceDto } from './services.dto';

const router = Router();
const ctrl = new ServicesController();

router.get('/', ctrl.getAll.bind(ctrl));
router.get('/my', authenticate, ctrl.getMine.bind(ctrl));
router.get('/:id', ctrl.getOne.bind(ctrl));
router.post('/', authenticate, authorize('super_admin', 'admin'), validate(createServiceDto), ctrl.create.bind(ctrl));
router.put('/:id', authenticate, authorize('super_admin', 'admin'), validate(updateServiceDto), ctrl.update.bind(ctrl));
router.delete('/:id', authenticate, authorize('super_admin', 'admin'), ctrl.delete.bind(ctrl));
router.post('/bookings/:bookingId', authenticate, ctrl.addToBooking.bind(ctrl));

export default router;
