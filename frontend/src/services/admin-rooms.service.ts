import api from '../lib/api';
import { Room, ApiResponse } from '../types';

export interface RoomPayload {
  hotelId: string;
  roomNumber: string;
  roomTypeId: string;
  floor: number;
}

export const adminRoomsService = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    api.get<ApiResponse<Room[]>>('/rooms', { params }).then((r) => r.data.data),

  create: (payload: RoomPayload) =>
    api.post<ApiResponse<Room>>('/rooms', payload).then((r) => r.data.data),

  update: (id: string, payload: Partial<RoomPayload>) =>
    api.patch<ApiResponse<Room>>(`/rooms/${id}`, payload).then((r) => r.data.data),

  updateStatus: (id: string, status: string) =>
    api.patch<ApiResponse<Room>>(`/rooms/${id}/status`, { status }).then((r) => r.data.data),

  remove: (id: string) => api.delete(`/rooms/${id}`).then((r) => r.data),
};
