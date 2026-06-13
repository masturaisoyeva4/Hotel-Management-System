import api from '../lib/api';
import { Service, BookingService, ApiResponse } from '../types';

export interface HotelServicePayload {
  hotelId: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  isAvailable?: boolean;
}

export const hotelServicesService = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    api.get<ApiResponse<Service[]>>('/services', { params }).then((r) => r.data.data),

  getMine: () =>
    api.get<ApiResponse<BookingService[]>>('/services/my').then((r) => r.data.data),

  create: (payload: HotelServicePayload) =>
    api.post<ApiResponse<Service>>('/services', payload).then((r) => r.data.data),

  update: (id: string, payload: Partial<HotelServicePayload>) =>
    api.put<ApiResponse<Service>>(`/services/${id}`, payload).then((r) => r.data.data),

  remove: (id: string) => api.delete(`/services/${id}`).then((r) => r.data),

  addToBooking: (bookingId: string, serviceId: string, quantity = 1) =>
    api
      .post<ApiResponse<{ id: string; quantity: number; price: number; service: Service }>>(
        `/services/bookings/${bookingId}`,
        { serviceId, quantity }
      )
      .then((r) => r.data.data),
};
