import { Router } from 'express';
import { ReviewsController } from './reviews.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createReviewDto } from './reviews.dto';

const router = Router();
const ctrl = new ReviewsController();

router.get('/', ctrl.getAll.bind(ctrl));
router.get('/:id', ctrl.getOne.bind(ctrl));
router.post('/', authenticate, authorize('guest'), validate(createReviewDto), ctrl.create.bind(ctrl));
router.put('/:id/approve', authenticate, authorize('super_admin', 'admin'), ctrl.approve.bind(ctrl));
router.delete('/:id', authenticate, authorize('super_admin', 'admin'), ctrl.delete.bind(ctrl));

export default router;
