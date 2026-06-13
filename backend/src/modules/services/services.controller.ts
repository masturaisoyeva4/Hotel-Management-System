import { Request, Response } from 'express';
import { ServicesService } from './services.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { sendSuccess } from '../../utils/response.utils';

const servicesService = new ServicesService();

export class ServicesController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await servicesService.findAll(req.query as Record<string, string>);
    sendSuccess(res, result.services, 'Services fetched', 200, result.meta);
  });

  getMine = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await servicesService.findMyBooked(req.user!.userId);
    sendSuccess(res, result, 'My services fetched');
  });

  getOne = asyncHandler(async (req: Request, res: Response) => {
    const service = await servicesService.findOne(req.params.id);
    sendSuccess(res, service);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const service = await servicesService.create(req.body);
    sendSuccess(res, service, 'Service created', 201);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const service = await servicesService.update(req.params.id, req.body);
    sendSuccess(res, service, 'Service updated');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await servicesService.delete(req.params.id);
    sendSuccess(res, null, 'Service deleted');
  });

  addToBooking = asyncHandler(async (req: Request, res: Response) => {
    const { serviceId, quantity = 1 } = req.body;
    const result = await servicesService.addToBooking(
      req.params.bookingId,
      serviceId,
      quantity
    );
    sendSuccess(res, result, 'Service added to booking', 201);
  });
}
