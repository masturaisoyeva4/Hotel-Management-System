import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { authLimiter } from '../../config/security';
import { registerDto, loginDto, refreshDto } from './auth.dto';

const router = Router();
const ctrl = new AuthController();

// Apply strict rate limiting to all auth routes
router.use(authLimiter);

router.post('/register', validate(registerDto), ctrl.register);
router.post('/login',    validate(loginDto),    ctrl.login);
router.post('/logout',   authenticate,          ctrl.logout);
router.post('/refresh',  validate(refreshDto),  ctrl.refresh);
router.get('/me',        authenticate,          ctrl.getMe);

export default router;
