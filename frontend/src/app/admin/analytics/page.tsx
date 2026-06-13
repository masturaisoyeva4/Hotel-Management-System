'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList,
} from 'recharts';
import { AlertCircle } from 'lucide-react';
import { FadeIn } from '../../../components/motion/FadeIn';
import { analyticsService } from '../../../services/analytics.service';
import { formatCurrency } from '../../../lib/utils';
import { getErrorMessage } from '../../../lib/error-handler';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function AdminAnalyticsPage() {
  const { data: overview, isError, error } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => analyticsService.getOverview(),
  });

  const { data: revenue } = useQuery({
    queryKey: ['analytics-revenue'],
    queryFn: () => analyticsService.getRevenue(12),
  });

  const { data: topRooms } = useQuery({
    queryKey: ['analytics-top-rooms'],
    queryFn: () => analyticsService.getTopRooms(),
  });

  // Occupancy pie data
  const occupancyData = overview ? [
    { name: 'Band', value: overview.occupiedRooms },
    { name: 'Bo\'sh', value: overview.totalRooms - overview.occupiedRooms },
  ] : [];

  // Bookings overview bar data
  const bookingsData = overview ? [
    { name: 'Jami bronlar', value: overview.totalBookings },
    { name: 'Faol bronlar', value: overview.activeBookings },
  ] : [];

  // General counts bar data
  const generalData = overview ? [
    { name: 'Jami xonalar', value: overview.totalRooms },
    { name: 'Band xonalar', value: overview.occupiedRooms },
    { name: 'Jami mehmonlar', value: overview.totalGuests },
  ] : [];

  // Revenue summary bar data
  const revenueData = overview ? [
    { name: 'Jami daromad', value: Number(overview.totalRevenue) },
  ] : [];

  // Top rooms bar data
  const topRoomsData = (topRooms || []).map((r, i) => ({
    name: `Xona ${i + 1}`,
    bronlar: r._count.roomId,
  }));

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analitika</h1>
          <p className="text-gray-500">Mehmonxona faoliyati ko'rsatkichlari</p>
        </div>
      </FadeIn>

      {isError ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100 text-red-600">
          <AlertCircle className="h-12 w-12 mx-auto mb-3" />
          <p>{getErrorMessage(error, "Ma'lumotlarni yuklashda xatolik")}</p>
        </div>
      ) : (
        <>
          {/* Revenue line chart */}
          <FadeIn delay={0.05}>
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Daromad tendensiyasi</h2>
              <p className="text-sm text-gray-400 mb-6">So'nggi 12 oy</p>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenue || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    dot={{ fill: '#3B82F6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </FadeIn>

          {/* Grid of chart cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Jami daromad */}
            <FadeIn delay={0.1}>
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Jami daromad</h2>
                <p className="text-sm text-gray-400 mb-6">Hozirgacha to'langan summa</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={revenueData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Bar dataKey="value" fill="#10B981" radius={[0, 6, 6, 0]} barSize={40}>
                      <LabelList dataKey="value" position="right" formatter={(v: number) => formatCurrency(v)} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </FadeIn>

            {/* Bronlar statistikasi */}
            <FadeIn delay={0.12}>
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Bronlar statistikasi</h2>
                <p className="text-sm text-gray-400 mb-6">Jami va faol bronlar</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={bookingsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {bookingsData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                      <LabelList dataKey="value" position="top" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </FadeIn>

            {/* Top rooms bar chart */}
            <FadeIn delay={0.15}>
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Eng ko'p bron qilingan xonalar</h2>
                <p className="text-sm text-gray-400 mb-6">Top 5 xona</p>
                {topRoomsData.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                    Ma'lumot yo'q
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={topRoomsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={60} />
                      <Tooltip />
                      <Bar dataKey="bronlar" fill="#8B5CF6" radius={[0, 6, 6, 0]}>
                        {topRoomsData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </FadeIn>

            {/* Occupancy pie chart */}
            <FadeIn delay={0.2}>
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Xonalar band bo'lishi</h2>
                <p className="text-sm text-gray-400 mb-6">Hozirgi holat</p>
                {occupancyData.length === 0 || overview?.totalRooms === 0 ? (
                  <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                    Ma'lumot yo'q
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={occupancyData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {occupancyData.map((_, index) => (
                            <Cell key={index} fill={index === 0 ? '#EF4444' : '#10B981'} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="text-center mt-2">
                      <p className="text-3xl font-bold text-gray-900">{overview?.occupancyRate}%</p>
                      <p className="text-sm text-gray-500">Band bo'lish darajasi</p>
                    </div>
                  </div>
                )}
              </div>
            </FadeIn>

            {/* General counts bar chart */}
            <FadeIn delay={0.25}>
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 lg:col-span-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Umumiy ko'rsatkichlar</h2>
                <p className="text-sm text-gray-400 mb-6">Xonalar va mehmonlar soni</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={generalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {generalData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                      <LabelList dataKey="value" position="top" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </FadeIn>
          </div>
        </>
      )}
    </div>
  );
}
