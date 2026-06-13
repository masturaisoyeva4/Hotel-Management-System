'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, LogIn, LogOut, Search, AlertCircle } from 'lucide-react';
import { FadeIn } from '../../../components/motion/FadeIn';
import { bookingsService } from '../../../services/bookings.service';
import { formatDate, formatCurrency, BOOKING_STATUS_COLORS } from '../../../lib/utils';
import { getErrorMessage } from '../../../lib/error-handler';

export default function AdminBookingsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionError, setActionError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['bookings', statusFilter],
    queryFn: () => bookingsService.getAll({ limit: 20, status: statusFilter || undefined }).then((r) => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'confirm' | 'checkin' | 'checkout' | 'cancel' }) =>
      bookingsService.updateStatus(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setActionError('');
    },
    onError: (err) => setActionError(getErrorMessage(err, 'Amalni bajarishda xatolik')),
  });

  const bookings = data || [];

  const filtered = bookings.filter((b) =>
    b.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
    b.guest?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const statusOptions = ['', 'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

  return (
    <div className="p-4 sm:p-6">
      <FadeIn>
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bronlar</h1>
            <p className="text-gray-500">Barcha bronlarni boshqaring</p>
          </div>
        </div>
      </FadeIn>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
          {actionError}
        </div>
      )}

      {/* Filters */}
      <FadeIn delay={0.05}>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Bron raqami yoki email bo'yicha qidiring..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s || "Barcha holatlar"}</option>
            ))}
          </select>
        </div>
      </FadeIn>

      {/* Table */}
      <FadeIn delay={0.1}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Bron №', 'Mehmon', 'Xona', 'Kirish', 'Chiqish', 'Narx', 'Holat', 'Amallar'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-red-600">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      {getErrorMessage(error, 'Bronlarni yuklashda xatolik')}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                      Bronlar topilmadi
                    </td>
                  </tr>
                ) : (
                  filtered.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-sm font-medium text-blue-600 whitespace-nowrap">
                        {booking.bookingNumber}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {booking.guest?.firstName} {booking.guest?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{booking.guest?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {booking.room?.roomNumber} — {booking.room?.roomType?.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(booking.checkInDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(booking.checkOutDate)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {formatCurrency(booking.totalPrice)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${BOOKING_STATUS_COLORS[booking.status]}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => updateStatus.mutate({ id: booking.id, action: 'confirm' })}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Tasdiqlash"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => updateStatus.mutate({ id: booking.id, action: 'checkin' })}
                              className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Check-in"
                            >
                              <LogIn className="h-4 w-4" />
                            </button>
                          )}
                          {booking.status === 'checked_in' && (
                            <button
                              onClick={() => updateStatus.mutate({ id: booking.id, action: 'checkout' })}
                              className="p-1 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Check-out"
                            >
                              <LogOut className="h-4 w-4" />
                            </button>
                          )}
                          {['pending', 'confirmed'].includes(booking.status) && (
                            <button
                              onClick={() => updateStatus.mutate({ id: booking.id, action: 'cancel' })}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Bekor qilish"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
