import { Router, raw } from 'express';
import { PaymentsController } from './payments.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createPaymentIntentDto } from './payments.dto';

const router = Router();
const ctrl = new PaymentsController();

// Stripe webhook needs raw body — must be before json middleware
router.post('/webhook', raw({ type: 'application/json' }), ctrl.webhook.bind(ctrl));

router.use(authenticate);
router.post('/intent', validate(createPaymentIntentDto), ctrl.createIntent.bind(ctrl));
router.get('/:id', ctrl.getOne.bind(ctrl));

export default router;
