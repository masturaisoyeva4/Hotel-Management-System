import { Router } from 'express';
import { InvoicesController } from './invoices.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { generateInvoiceDto, invoiceQueryDto } from './invoices.dto';

const router = Router();
const ctrl = new InvoicesController();

router.use(authenticate);

router.get(
  '/',
  authorize('super_admin', 'admin', 'receptionist'),
  validate(invoiceQueryDto, 'query'),
  ctrl.getAll.bind(ctrl)
);
router.get('/:id', ctrl.getOne.bind(ctrl));
router.post(
  '/generate',
  authorize('super_admin', 'admin', 'receptionist'),
  validate(generateInvoiceDto),
  ctrl.generate.bind(ctrl)
);
router.post('/bookings/:bookingId/pay', ctrl.pay.bind(ctrl));

export default router;
