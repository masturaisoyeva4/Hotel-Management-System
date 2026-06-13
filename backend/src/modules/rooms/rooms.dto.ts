import { z } from 'zod';

export const createRoomDto = z.object({
  hotelId: z.string().uuid('Invalid hotel ID'),
  roomNumber: z
    .string()
    .min(1)
    .max(10)
    .regex(/^[A-Za-z0-9\-]+$/, 'Room number must be alphanumeric'),
  roomTypeId: z.string().uuid('Invalid room type ID'),
  floor: z.number().int().min(1).max(200).default(1),
});

export const updateRoomDto = createRoomDto
  .omit({ hotelId: true })
  .partial();

export const updateRoomStatusDto = z.object({
  status: z.enum(['available', 'occupied', 'maintenance', 'cleaning'], {
    errorMap: () => ({
      message: 'Status must be: available, occupied, maintenance, or cleaning',
    }),
  }),
});

export const roomAvailabilityDto = z.object({
  hotelId: z.string().uuid('Invalid hotel ID'),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  roomTypeId: z.string().uuid().optional(),
});

export const roomBookedDatesDto = z.object({
  hotelId: z.string().uuid('Invalid hotel ID'),
});

export const roomQueryDto = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  hotelId: z.string().uuid().optional(),
  status: z.enum(['available', 'occupied', 'maintenance', 'cleaning']).optional(),
  floor: z.coerce.number().int().optional(),
});

export type CreateRoomDto = z.infer<typeof createRoomDto>;
export type UpdateRoomDto = z.infer<typeof updateRoomDto>;
export type RoomAvailabilityDto = z.infer<typeof roomAvailabilityDto>;
export type RoomBookedDatesDto = z.infer<typeof roomBookedDatesDto>;
