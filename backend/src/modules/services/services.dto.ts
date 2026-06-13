import { z } from 'zod';

export const createServiceDto = z.object({
  hotelId: z.string().uuid('Invalid hotel ID'),
  name: z.string().min(2).max(255).trim(),
  description: z.string().max(1000).optional(),
  category: z.enum([
    'restaurant',
    'spa',
    'transport',
    'laundry',
    'entertainment',
    'fitness',
    'business',
    'other',
  ]),
  price: z.number().positive('Price must be positive'),
});

export const updateServiceDto = createServiceDto
  .omit({ hotelId: true })
  .partial();

export const addServiceToBookingDto = z.object({
  serviceId: z.string().uuid('Invalid service ID'),
  quantity: z.number().int().min(1).max(50).default(1),
});

export type CreateServiceDto = z.infer<typeof createServiceDto>;
