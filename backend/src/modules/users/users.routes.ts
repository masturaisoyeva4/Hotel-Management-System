import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateProfileDto, changePasswordDto } from './users.dto';

const router = Router();
const ctrl = new UsersController();

// All routes require auth
router.use(authenticate);

// Self-service routes
router.put('/me',          validate(updateProfileDto),   ctrl.updateMe);
router.put('/me/password', validate(changePasswordDto),  ctrl.changePassword);

// Admin-only routes
router.get('/',     authorize('super_admin', 'admin'), ctrl.getAll);
router.get('/:id',  authorize('super_admin', 'admin'), ctrl.getOne);
router.patch('/:id/toggle-active', authorize('super_admin'), ctrl.toggleActive);

export default router;
