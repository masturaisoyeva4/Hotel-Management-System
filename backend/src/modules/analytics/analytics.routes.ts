import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';

const router = Router();
const ctrl = new AnalyticsController();

router.use(authenticate, authorize('super_admin', 'admin'));

router.get('/overview', ctrl.getOverview.bind(ctrl));
router.get('/revenue', ctrl.getRevenue.bind(ctrl));
router.get('/top-rooms', ctrl.getTopRooms.bind(ctrl));

export default router;
