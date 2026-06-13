import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { asyncHandler } from '../../middleware/error.middleware';
import { sendSuccess } from '../../utils/response.utils';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  getOverview = asyncHandler(async (req: Request, res: Response) => {
    const { hotelId } = req.query as { hotelId?: string };
    const data = await analyticsService.getOverview(hotelId);
    sendSuccess(res, data, 'Overview fetched');
  });

  getRevenue = asyncHandler(async (req: Request, res: Response) => {
    const { hotelId, months } = req.query as { hotelId?: string; months?: string };
    const data = await analyticsService.getRevenueChart(hotelId, Number(months) || 6);
    sendSuccess(res, data, 'Revenue chart fetched');
  });

  getTopRooms = asyncHandler(async (req: Request, res: Response) => {
    const { hotelId } = req.query as { hotelId?: string };
    const data = await analyticsService.getTopRooms(hotelId);
    sendSuccess(res, data, 'Top rooms fetched');
  });
}
