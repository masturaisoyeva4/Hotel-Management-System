import api from '../lib/api';
import { Review, ApiResponse } from '../types';

export const adminReviewsService = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    api.get<ApiResponse<Review[]>>('/reviews', { params }).then((r) => r.data.data),

  approve: (id: string) =>
    api.put<ApiResponse<Review>>(`/reviews/${id}/approve`).then((r) => r.data.data),

  remove: (id: string) => api.delete(`/reviews/${id}`).then((r) => r.data),
};
