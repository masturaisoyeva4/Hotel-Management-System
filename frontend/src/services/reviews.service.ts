import api from '../lib/api';
import { Review, ApiResponse } from '../types';

export interface CreateReviewPayload {
  bookingId: string;
  hotelId: string;
  rating: number;
  cleanlinessRating: number;
  serviceRating: number;
  comfortRating: number;
  comment?: string;
}

export const reviewsService = {
  create: (payload: CreateReviewPayload) =>
    api.post<ApiResponse<Review>>('/reviews', payload).then((r) => r.data.data),
};
