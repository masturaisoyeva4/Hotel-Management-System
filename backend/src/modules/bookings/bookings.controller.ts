import { Request, Response } from 'express';
import { BookingsService } from './bookings.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { sendSuccess } from '../../utils/response.utils';
import { BookingQueryDto } from './bookings.dto';

const bookingsService = new BookingsService();

export class BookingsController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await bookingsService.findAll(
      req.query as unknown as BookingQueryDto,
      req.user!.userId,
      req.user!.role
    );
    sendSuccess(res, result.bookings, 'Bookings fetched', 200, result.meta);
  });

  getOne = asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingsService.findOne(req.params.id);
    sendSuccess(res, booking);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const booking = await bookingsService.create(req.body, req.user!.userId);
    sendSuccess(res, booking, 'Booking created', 201);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const booking = await bookingsService.update(
      req.params.id,
      req.body,
      req.user!.userId,
      req.user!.role
    );
    sendSuccess(res, booking, 'Booking updated');
  });

  confirm = asyncHandler(async (_req: Request, res: Response) => {
    const booking = await bookingsService.transition(_req.params.id, 'confirm');
    sendSuccess(res, booking, 'Booking confirmed');
  });

  checkIn = asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingsService.transition(req.params.id, 'checkin');
    sendSuccess(res, booking, 'Guest checked in');
  });

  checkOut = asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingsService.transition(req.params.id, 'checkout');
    sendSuccess(res, booking, 'Guest checked out');
  });

  cancel = asyncHandler(async (req: AuthRequest, res: Response) => {
    const booking = await bookingsService.cancel(
      req.params.id,
      req.user!.userId,
      req.user!.role
    );
    sendSuccess(res, booking, 'Booking cancelled');
  });
}
