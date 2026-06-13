import { Request, Response } from 'express';
import { EmployeesService } from './employees.service';
import { asyncHandler } from '../../middleware/error.middleware';
import { sendSuccess } from '../../utils/response.utils';

const employeesService = new EmployeesService();

export class EmployeesController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await employeesService.findAll(req.query as Record<string, string>);
    sendSuccess(res, result.employees, 'Employees fetched', 200, result.meta);
  });

  getOne = asyncHandler(async (req: Request, res: Response) => {
    const employee = await employeesService.findOne(req.params.id);
    sendSuccess(res, employee);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const employee = await employeesService.create(req.body);
    sendSuccess(res, employee, 'Employee created', 201);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const employee = await employeesService.update(req.params.id, req.body);
    sendSuccess(res, employee, 'Employee updated');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await employeesService.delete(req.params.id);
    sendSuccess(res, null, 'Employee deleted');
  });
}
