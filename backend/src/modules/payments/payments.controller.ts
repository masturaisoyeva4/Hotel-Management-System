import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { asyncHandler } from '../../middleware/error.middleware';
import { sendSuccess } from '../../utils/response.utils';

const paymentsService = new PaymentsService();

export class PaymentsController {
  createIntent = asyncHandler(async (req: Request, res: Response) => {
    const result = await paymentsService.createPaymentIntent(req.body.invoiceId);
    sendSuccess(res, result, 'Payment intent created');
  });

  // Webhook bypasses asyncHandler — needs raw error handling for Stripe signature
  webhook = async (req: Request, res: Response) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const result = await paymentsService.handleWebhook(req.body as Buffer, signature);
      res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Webhook error';
      res.status(400).json({ success: false, message });
    }
  };

  getOne = asyncHandler(async (req: Request, res: Response) => {
    const payment = await paymentsService.findOne(req.params.id);
    sendSuccess(res, payment);
  });
}
