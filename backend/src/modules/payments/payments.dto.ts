import { z } from 'zod';

export const createPaymentIntentDto = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID'),
});

export const confirmPaymentDto = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
  invoiceId: z.string().uuid('Invalid invoice ID'),
});

export type CreatePaymentIntentDto = z.infer<typeof createPaymentIntentDto>;
export type ConfirmPaymentDto = z.infer<typeof confirmPaymentDto>;
