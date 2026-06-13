import { z } from 'zod';

const ratingSchema = z
  .number()
  .int()
  .min(1, 'Rating must be at least 1')
  .max(5, 'Rating must be at most 5');

export const createReviewDto = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  hotelId: z.string().uuid('Invalid hotel ID'),
  rating: ratingSchema,
  cleanlinessRating: ratingSchema,
  serviceRating: ratingSchema,
  comfortRating: ratingSchema,
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(2000).optional(),
});

export type CreateReviewDto = z.infer<typeof createReviewDto>;
