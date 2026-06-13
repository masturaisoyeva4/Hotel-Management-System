import api from '../lib/api';
import { Booking, ApiResponse } from '../types';

export interface CreateBookingPayload {
  roomId: string;
  hotelId: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children?: number;
  specialRequests?: string;
}

export interface BookingQuery {
  page?: number;
  limit?: number;
  status?: string;
}

export const bookingsService = {
  getAll: (params?: BookingQuery) =>
    api.get<ApiResponse<Booking[]>>('/bookings', { params }).then((r) => r.data),

  getOne: (id: string) => api.get<ApiResponse<Booking>>(`/bookings/${id}`).then((r) => r.data.data),

  create: (payload: CreateBookingPayload) =>
    api.post<ApiResponse<Booking>>('/bookings', payload).then((r) => r.data.data),

  cancel: (id: string) => api.put<ApiResponse<Booking>>(`/bookings/${id}/cancel`).then((r) => r.data.data),

  updateStatus: (id: string, action: 'confirm' | 'checkin' | 'checkout' | 'cancel') =>
    api.put<ApiResponse<Booking>>(`/bookings/${id}/${action}`).then((r) => r.data.data),
};
