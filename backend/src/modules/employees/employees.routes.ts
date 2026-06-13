import { Router } from 'express';
import { EmployeesController } from './employees.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createEmployeeDto, updateEmployeeDto } from './employees.dto';

const router = Router();
const ctrl = new EmployeesController();

router.use(authenticate, authorize('super_admin', 'admin'));

router.get('/', ctrl.getAll.bind(ctrl));
router.get('/:id', ctrl.getOne.bind(ctrl));
router.post('/', validate(createEmployeeDto), ctrl.create.bind(ctrl));
router.put('/:id', validate(updateEmployeeDto), ctrl.update.bind(ctrl));
router.delete('/:id', ctrl.delete.bind(ctrl));

export default router;
