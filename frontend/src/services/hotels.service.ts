import api from '../lib/api';
import { Hotel, ApiResponse } from '../types';

export interface HotelQuery {
  page?: number;
  limit?: number;
  city?: string;
  country?: string;
  stars?: number;
}

export const hotelsService = {
  getAll: (params?: HotelQuery) =>
    api.get<ApiResponse<Hotel[]>>('/hotels', { params }).then((r) => r.data),

  getOne: (id: string) =>
    api.get<ApiResponse<Hotel>>(`/hotels/${id}`).then((r) => r.data.data),

  create: (payload: Partial<Hotel>) =>
    api.post<ApiResponse<Hotel>>('/hotels', payload).then((r) => r.data.data),

  update: (id: string, payload: Partial<Hotel>) =>
    api.put<ApiResponse<Hotel>>(`/hotels/${id}`, payload).then((r) => r.data.data),

  remove: (id: string) => api.delete(`/hotels/${id}`).then((r) => r.data),
};
