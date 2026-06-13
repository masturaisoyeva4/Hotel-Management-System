import { Router } from 'express';
import { HotelsController } from './hotels.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createHotelDto, updateHotelDto } from './hotels.dto';

const router = Router();
const ctrl = new HotelsController();

router.get('/', ctrl.getAll.bind(ctrl));
router.get('/:id', ctrl.getOne.bind(ctrl));
router.post('/', authenticate, authorize('super_admin', 'admin'), validate(createHotelDto), ctrl.create.bind(ctrl));
router.put('/:id', authenticate, authorize('super_admin', 'admin'), validate(updateHotelDto), ctrl.update.bind(ctrl));
router.delete('/:id', authenticate, authorize('super_admin'), ctrl.delete.bind(ctrl));

export default router;
