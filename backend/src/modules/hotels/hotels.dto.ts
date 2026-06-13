import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createHotelDto = z.object({
  name: z.string().min(2).max(255).trim(),
  description: z.string().max(2000).optional(),
  address: z.string().min(5).max(500).trim(),
  city: z.string().min(2).max(100).trim(),
  country: z.string().min(2).max(100).trim(),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Invalid phone number')
    .optional(),
  email: z.string().email().optional(),
  starRating: z.number().int().min(1).max(5).default(3),
  checkInTime: z
    .string()
    .regex(timeRegex, 'Time must be HH:MM format')
    .default('14:00'),
  checkOutTime: z
    .string()
    .regex(timeRegex, 'Time must be HH:MM format')
    .default('12:00'),
});

export const updateHotelDto = createHotelDto.partial();

export const hotelQueryDto = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  city: z.string().optional(),
  country: z.string().optional(),
  stars: z.coerce.number().int().min(1).max(5).optional(),
});

export type CreateHotelDto = z.infer<typeof createHotelDto>;
export type UpdateHotelDto = z.infer<typeof updateHotelDto>;
export type HotelQueryDto = z.infer<typeof hotelQueryDto>;
