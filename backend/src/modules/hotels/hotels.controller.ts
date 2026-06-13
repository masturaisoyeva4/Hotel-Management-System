import { Request, Response } from 'express';
import { HotelsService } from './hotels.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { sendSuccess } from '../../utils/response.utils';

const hotelsService = new HotelsService();

export class HotelsController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await hotelsService.findAll(req.query as Record<string, string>);
    sendSuccess(res, result.hotels, 'Hotels fetched', 200, result.meta);
  });

  getOne = asyncHandler(async (req: Request, res: Response) => {
    const hotel = await hotelsService.findOne(req.params.id);
    sendSuccess(res, hotel);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const hotel = await hotelsService.create(req.body, req.user!.userId);
    sendSuccess(res, hotel, 'Hotel created', 201);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const hotel = await hotelsService.update(req.params.id, req.body);
    sendSuccess(res, hotel, 'Hotel updated');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await hotelsService.delete(req.params.id);
    sendSuccess(res, null, 'Hotel deleted');
  });
}
