import api from '../lib/api';
import { Room, ApiResponse } from '../types';

export interface RoomAvailabilityQuery {
  hotelId: string;
  checkInDate: string;
  checkOutDate: string;
  adults?: number;
}

export interface BookedDateRange {
  checkInDate: string;
  checkOutDate: string;
}

export const roomsService = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    api.get<ApiResponse<Room[]>>('/rooms', { params }).then((r) => r.data),

  getAvailable: (params: RoomAvailabilityQuery) =>
    api.get<ApiResponse<Room[]>>('/rooms/available', { params }).then((r) => r.data.data),

  getBookedDates: (hotelId: string) =>
    api
      .get<ApiResponse<Record<string, BookedDateRange[]>>>('/rooms/booked-dates', { params: { hotelId } })
      .then((r) => r.data.data),

  getOne: (id: string) => api.get<ApiResponse<Room>>(`/rooms/${id}`).then((r) => r.data.data),
};
