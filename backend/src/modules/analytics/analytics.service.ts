import { prisma } from '../../config/database';

export class AnalyticsService {
  async getOverview(hotelId?: string) {
    const where = hotelId ? { hotelId } : {};

    const [
      totalBookings,
      activeBookings,
      totalRevenue,
      totalRooms,
      occupiedRooms,
      totalGuests,
    ] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.count({ where: { ...where, status: { in: ['confirmed', 'checked_in'] } } }),
      prisma.invoice.aggregate({ where: { ...where, paymentStatus: 'paid' }, _sum: { totalAmount: true } }),
      prisma.room.count({ where: { ...(hotelId ? { hotelId } : {}), isActive: true } }),
      prisma.room.count({ where: { ...(hotelId ? { hotelId } : {}), status: 'occupied' } }),
      prisma.user.count({ where: { role: 'guest' } }),
    ]);

    const occupancyRate = totalRooms > 0
      ? Math.round((occupiedRooms / totalRooms) * 100)
      : 0;

    return {
      totalBookings,
      activeBookings,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalRooms,
      occupiedRooms,
      occupancyRate,
      totalGuests,
    };
  }

  async getRevenueChart(hotelId?: string, months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const invoices = await prisma.invoice.findMany({
      where: {
        ...(hotelId ? { hotelId } : {}),
        paymentStatus: 'paid',
        paidAt: { gte: startDate },
      },
      select: { paidAt: true, totalAmount: true },
    });

    // Group by month
    const monthlyRevenue: Record<string, number> = {};
    invoices.forEach((inv) => {
      if (inv.paidAt) {
        const key = inv.paidAt.toISOString().slice(0, 7); // YYYY-MM
        monthlyRevenue[key] = (monthlyRevenue[key] || 0) + Number(inv.totalAmount);
      }
    });

    return Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async getTopRooms(hotelId?: string, limit = 5) {
    const where = hotelId ? { hotelId } : {};
    return prisma.booking.groupBy({
      by: ['roomId'],
      where,
      _count: { roomId: true },
      orderBy: { _count: { roomId: 'desc' } },
      take: limit,
    });
  }
}
