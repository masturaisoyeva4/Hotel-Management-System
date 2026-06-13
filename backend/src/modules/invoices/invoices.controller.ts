import { Request, Response } from 'express';
import { InvoicesService } from './invoices.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { sendSuccess } from '../../utils/response.utils';

const invoicesService = new InvoicesService();

export class InvoicesController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await invoicesService.findAll(req.query as Record<string, string>);
    sendSuccess(res, result.invoices, 'Invoices fetched', 200, result.meta);
  });

  getOne = asyncHandler(async (req: Request, res: Response) => {
    const invoice = await invoicesService.findOne(req.params.id);
    sendSuccess(res, invoice);
  });

  generate = asyncHandler(async (req: Request, res: Response) => {
    const invoice = await invoicesService.generate(req.body.bookingId, req.body.paymentMethod);
    sendSuccess(res, invoice, 'Invoice generated', 201);
  });

  pay = asyncHandler(async (req: AuthRequest, res: Response) => {
    const invoice = await invoicesService.payForBooking(
      req.params.bookingId,
      req.user!.userId,
      req.user!.role
    );
    sendSuccess(res, invoice, 'Payment successful');
  });
}
