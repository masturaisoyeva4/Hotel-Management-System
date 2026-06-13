import api from '../lib/api';
import { ApiResponse } from '../types';

export interface AnalyticsOverview {
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  totalGuests: number;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export interface TopRoom {
  roomId: string;
  _count: { roomId: number };
}

export const analyticsService = {
  getOverview: () =>
    api.get<ApiResponse<AnalyticsOverview>>('/analytics/overview').then((r) => r.data.data),

  getRevenue: (months?: number) =>
    api.get<ApiResponse<RevenuePoint[]>>('/analytics/revenue', { params: { months } }).then((r) => r.data.data),

  getTopRooms: () =>
    api.get<ApiResponse<TopRoom[]>>('/analytics/top-rooms').then((r) => r.data.data),
};
