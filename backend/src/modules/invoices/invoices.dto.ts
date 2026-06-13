import { z } from 'zod';

export const generateInvoiceDto = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  paymentMethod: z.enum(['cash', 'card', 'online', 'bank_transfer'], {
    errorMap: () => ({ message: 'Payment method must be: cash, card, online, or bank_transfer' }),
  }),
  discountAmount: z.number().min(0).default(0),
});

export const invoiceQueryDto = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  hotelId: z.string().uuid().optional(),
  paymentStatus: z.enum(['pending', 'paid', 'refunded', 'failed']).optional(),
});

export type GenerateInvoiceDto = z.infer<typeof generateInvoiceDto>;
export type InvoiceQueryDto = z.infer<typeof invoiceQueryDto>;
