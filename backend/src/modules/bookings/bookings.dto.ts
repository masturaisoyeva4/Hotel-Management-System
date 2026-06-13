import { z } from 'zod';

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format')
  .refine((d) => !isNaN(new Date(d).getTime()), 'Invalid date');

export const createBookingDto = z
  .object({
    roomId: z.string().uuid('Invalid room ID'),
    hotelId: z.string().uuid('Invalid hotel ID'),
    checkInDate: dateSchema,
    checkOutDate: dateSchema,
    adults: z.number().int().min(1).max(10).default(1),
    children: z.number().int().min(0).max(10).default(0),
    specialRequests: z.string().max(500).optional(),
  })
  .refine(
    (d) => new Date(d.checkOutDate) > new Date(d.checkInDate),
    { message: 'Check-out date must be after check-in date', path: ['checkOutDate'] }
  )
  .refine(
    (d) => new Date(d.checkInDate) >= new Date(new Date().toISOString().split('T')[0]),
    { message: 'Check-in date cannot be in the past', path: ['checkInDate'] }
  );

export const updateBookingDto = z.object({
  specialRequests: z.string().max(500).optional(),
  adults: z.number().int().min(1).max(10).optional(),
  children: z.number().int().min(0).max(10).optional(),
});

export const bookingQueryDto = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  hotelId: z.string().uuid().optional(),
  status: z
    .enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'])
    .optional(),
});

export type CreateBookingDto = z.infer<typeof createBookingDto>;
export type UpdateBookingDto = z.infer<typeof updateBookingDto>;
export type BookingQueryDto = z.infer<typeof bookingQueryDto>;
