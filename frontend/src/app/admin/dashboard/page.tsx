'use client';

import { useQuery } from '@tanstack/react-query';
import { Hotel, Users, BookOpen, DollarSign, TrendingUp, BedDouble, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FadeIn, StaggerGroup, StaggerItem } from '../../../components/motion/FadeIn';
import { analyticsService } from '../../../services/analytics.service';
import { formatCurrency } from '../../../lib/utils';
import { getErrorMessage } from '../../../lib/error-handler';

export default function AdminDashboard() {
  const { data: overview, isError, error } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => analyticsService.getOverview(),
  });

  const { data: revenueChart } = useQuery({
    queryKey: ['analytics-revenue'],
    queryFn: () => analyticsService.getRevenue(),
  });

  const stats = [
    { label: 'Jami bronlar', value: overview?.totalBookings || 0, icon: BookOpen, color: 'bg-blue-500', change: '+12%' },
    { label: 'Faol bronlar', value: overview?.activeBookings || 0, icon: Hotel, color: 'bg-green-500', change: '+5%' },
    { label: 'Jami daromad', value: formatCurrency(overview?.totalRevenue || 0), icon: DollarSign, color: 'bg-purple-500', change: '+18%' },
    { label: 'Band bo\'lish', value: `${overview?.occupancyRate || 0}%`, icon: BedDouble, color: 'bg-orange-500', change: '+3%' },
    { label: 'Mehmonlar', value: overview?.totalGuests || 0, icon: Users, color: 'bg-pink-500', change: '+8%' },
    { label: 'Jami xonalar', value: overview?.totalRooms || 0, icon: TrendingUp, color: 'bg-indigo-500', change: '' },
  ];

  return (
    <div className="p-4 sm:p-6">
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Umumiy ko'rsatkichlar</p>
        </div>
      </FadeIn>

      {isError ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100 text-red-600">
          <AlertCircle className="h-12 w-12 mx-auto mb-3" />
          <p>{getErrorMessage(error, "Ma'lumotlarni yuklashda xatolik")}</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {stats.map((stat, i) => (
              <StaggerItem key={i}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-xl`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    {stat.change && (
                      <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-lg">
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>

          {/* Revenue Chart */}
          <FadeIn delay={0.1}>
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Daromad grafigi (so'nggi 6 oy)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueChart || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </FadeIn>
        </>
      )}
    </div>
  );
}
