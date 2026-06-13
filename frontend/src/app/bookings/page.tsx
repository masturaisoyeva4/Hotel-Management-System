'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Calendar, MapPin, XCircle, Star, AlertCircle, CreditCard } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { StaggerGroup, StaggerItem } from '../../components/motion/FadeIn';
import { PaymentModal } from '../../components/payment/PaymentModal';
import { bookingsService } from '../../services/bookings.service';
import { Booking } from '../../types';
import { formatDate, formatCurrency, calcNights, BOOKING_STATUS_COLORS, cn } from '../../lib/utils';
import { getErrorMessage } from '../../lib/error-handler';

export default function GuestBookingsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Booking | null>(null);
  const [cancelError, setCancelError] = useState('');
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-bookings', statusFilter],
    queryFn: () =>
      bookingsService.getAll({ limit: 20, status: statusFilter || undefined }).then((r) => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingsService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      setSelected(null);
      setCancelError('');
    },
    onError: (err) => setCancelError(getErrorMessage(err, 'Bekor qilishda xatolik')),
  });

  const bookings = data || [];
  const STATUS_TABS = [
    { value: '', label: 'Barchasi' },
    { value: 'pending', label: 'Kutmoqda' },
    { value: 'confirmed', label: 'Tasdiqlangan' },
    { value: 'checked_in', label: 'Kirgan' },
    { value: 'checked_out', label: 'Chiqqan' },
    { value: 'cancelled', label: 'Bekor' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Mening bronlarim</h1>
          <p className="text-sm text-gray-500">{bookings.length} ta bron</p>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                statusFilter === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-36 animate-pulse" />)}
          </div>
        ) : isError ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100 text-red-600">
            <AlertCircle className="h-14 w-14 mx-auto mb-4" />
            <p>{getErrorMessage(error, 'Bronlarni yuklashda xatolik yuz berdi')}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
            <BookOpen className="h-14 w-14 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-900 mb-2">Bronlar yo'q</p>
            <p className="text-gray-500 mb-6">Birinchi broningizni qiling</p>
            <Link
              href="/rooms-select"
              className="inline-flex bg-aura-emerald text-white px-6 py-3 rounded-xl font-medium hover:bg-aura-emerald-light transition-colors"
            >
              Xona tanlash
            </Link>
          </div>
        ) : (
          <StaggerGroup className="space-y-4">
            {bookings.map((booking) => {
              const nights = calcNights(booking.checkInDate, booking.checkOutDate);
              return (
                <StaggerItem key={booking.id}>
                  <div
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelected(booking)}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{booking.hotel?.name}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{booking.hotel?.city}</span>
                          </div>
                        </div>
                        <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium shrink-0', BOOKING_STATUS_COLORS[booking.status])}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-gray-50 rounded-xl p-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Kirish</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(booking.checkInDate)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-400 mb-0.5">Tunlar</p>
                          <p className="text-sm font-bold text-blue-600">{nights}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 mb-0.5">Chiqish</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(booking.checkOutDate)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm text-gray-500 truncate">
                          Xona: <span className="font-medium text-gray-900">{booking.room?.roomNumber} — {booking.room?.roomType?.name}</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 shrink-0">{formatCurrency(booking.totalPrice)}</p>
                      </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-gray-400 truncate">{booking.bookingNumber}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        {booking.status === 'checked_out' && (
                          <Link
                            href={`/reviews/new?bookingId=${booking.id}&hotelId=${booking.hotelId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs text-yellow-600 hover:underline"
                          >
                            <Star className="h-3.5 w-3.5" /> Sharh qoldirish
                          </Link>
                        )}
                        {['pending', 'confirmed'].includes(booking.status) && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPayingBooking(booking);
                              }}
                              className="flex items-center gap-1 text-xs text-aura-emerald font-medium hover:underline"
                            >
                              <CreditCard className="h-3.5 w-3.5" /> To'lov qilish
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Bronni bekor qilishni tasdiqlaysizmi?')) cancelMutation.mutate(booking.id);
                              }}
                              className="flex items-center gap-1 text-xs text-red-600 hover:underline"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Bekor qilish
                            </button>
                          </>
                        )}
                        <span className="text-xs text-blue-600">Batafsil →</span>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Bron tafsilotlari</h2>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <XCircle className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {cancelError && (
                  <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm">
                    {cancelError}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-blue-600 font-bold">{selected.bookingNumber}</span>
                  <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', BOOKING_STATUS_COLORS[selected.status])}>
                    {selected.status}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                  {[
                    { label: 'Mehmonxona', value: selected.hotel?.name },
                    { label: 'Xona', value: `${selected.room?.roomNumber} — ${selected.room?.roomType?.name}` },
                    { label: 'Kirish', value: formatDate(selected.checkInDate) },
                    { label: 'Chiqish', value: formatDate(selected.checkOutDate) },
                    { label: 'Tunlar', value: `${calcNights(selected.checkInDate, selected.checkOutDate)} tun` },
                    { label: 'Kattalar', value: `${selected.adults} kishi` },
                    { label: 'Bolalar', value: `${selected.children} kishi` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>

                {selected.specialRequests && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Maxsus talablar</p>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{selected.specialRequests}</p>
                  </div>
                )}

                <div className="flex justify-between items-center bg-blue-50 rounded-xl p-4">
                  <span className="font-semibold text-gray-900">Jami narx</span>
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(selected.totalPrice)}</span>
                </div>

                {['pending', 'confirmed'].includes(selected.status) && (
                  <button
                    onClick={() => setPayingBooking(selected)}
                    className="w-full bg-aura-emerald text-white py-2.5 rounded-xl text-sm font-medium hover:bg-aura-emerald-light transition-colors flex items-center justify-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" /> To'lov qilish
                  </button>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setSelected(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                    Yopish
                  </button>
                  {['pending', 'confirmed'].includes(selected.status) && (
                    <button
                      onClick={() => { if (confirm('Bekor qilish?')) cancelMutation.mutate(selected.id); }}
                      disabled={cancelMutation.isPending}
                      className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      Bekor qilish
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {payingBooking && (
        <PaymentModal
          bookingId={payingBooking.id}
          orderNumber={payingBooking.bookingNumber}
          title={payingBooking.hotel?.name || 'Bron uchun to\'lov'}
          subtitle={`Xona ${payingBooking.room?.roomNumber || ''} — ${calcNights(payingBooking.checkInDate, payingBooking.checkOutDate)} tun`}
          amount={Number(payingBooking.totalPrice)}
          onClose={() => setPayingBooking(null)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['my-bookings'] })}
        />
      )}
    </div>
  );
}
