import { Request, Response } from 'express';
import { RoomsService } from './rooms.service';
import { asyncHandler } from '../../middleware/error.middleware';
import { sendSuccess } from '../../utils/response.utils';

const roomsService = new RoomsService();

export class RoomsController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await roomsService.findAll(req.query as Record<string, string>);
    sendSuccess(res, result.rooms, 'Rooms fetched', 200, result.meta);
  });

  getAvailable = asyncHandler(async (req: Request, res: Response) => {
    const { hotelId, checkInDate, checkOutDate, roomTypeId } =
      req.query as Record<string, string>;
    const rooms = await roomsService.findAvailable(
      hotelId, checkInDate, checkOutDate, roomTypeId
    );
    sendSuccess(res, rooms, 'Available rooms fetched');
  });

  getBookedDates = asyncHandler(async (req: Request, res: Response) => {
    const { hotelId } = req.query as Record<string, string>;
    const bookedDates = await roomsService.getBookedDates(hotelId);
    sendSuccess(res, bookedDates, 'Booked dates fetched');
  });

  getOne = asyncHandler(async (req: Request, res: Response) => {
    const room = await roomsService.findOne(req.params.id);
    sendSuccess(res, room);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const room = await roomsService.create(req.body);
    sendSuccess(res, room, 'Room created', 201);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const room = await roomsService.update(req.params.id, req.body);
    sendSuccess(res, room, 'Room updated');
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const room = await roomsService.updateStatus(req.params.id, req.body.status);
    sendSuccess(res, room, 'Room status updated');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await roomsService.delete(req.params.id);
    sendSuccess(res, null, 'Room deleted');
  });
}
