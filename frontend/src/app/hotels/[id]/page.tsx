'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Star, Clock, Users, Wifi, Check, Loader2, AlertCircle } from 'lucide-react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { FadeIn, StaggerGroup, StaggerItem } from '../../../components/motion/FadeIn';
import { hotelsService } from '../../../services/hotels.service';
import { roomsService } from '../../../services/rooms.service';
import { bookingsService } from '../../../services/bookings.service';
import { Hotel, Room } from '../../../types';
import { formatCurrency, formatDate, calcNights } from '../../../lib/utils';
import { useAuthStore } from '../../../store/authStore';
import { getErrorMessage } from '../../../lib/error-handler';

export default function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [adults, setAdults] = useState(1);
  const [bookingError, setBookingError] = useState('');

  const { data: hotel, isLoading, isError, error } = useQuery<Hotel>({
    queryKey: ['hotel', id],
    queryFn: () => hotelsService.getOne(id),
  });

  const { data: availableRooms, refetch: refetchRooms } = useQuery<Room[]>({
    queryKey: ['available-rooms', id, checkIn, checkOut],
    queryFn: () => roomsService.getAvailable({ hotelId: id, checkInDate: checkIn, checkOutDate: checkOut, adults }),
    enabled: !!(checkIn && checkOut),
  });

  const { data: allRooms } = useQuery<Room[]>({
    queryKey: ['hotel-rooms', id],
    queryFn: () => roomsService.getAll({ hotelId: id, limit: 100 }).then((r) => r.data),
  });

  const { data: bookedDates } = useQuery({
    queryKey: ['rooms-booked-dates', id],
    queryFn: () => roomsService.getBookedDates(id),
  });

  const bookMutation = useMutation({
    mutationFn: (data: Parameters<typeof bookingsService.create>[0]) => bookingsService.create(data),
    onSuccess: () => router.push('/dashboard'),
    onError: (err: unknown) => setBookingError(getErrorMessage(err, 'Bron qilishda xatolik')),
  });

  const handleBook = () => {
    if (!user) { router.push('/auth/login'); return; }
    if (!selectedRoom) { setBookingError('Xona tanlang'); return; }
    setBookingError('');
    bookMutation.mutate({
      roomId: selectedRoom.id,
      hotelId: hotel.id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adults,
      children: 0,
    });
  };

  const nights = checkIn && checkOut ? calcNights(checkIn, checkOut) : 0;
  const totalPrice = selectedRoom ? Number(selectedRoom.roomType.basePrice) * nights : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !hotel) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-red-600 px-4 text-center">
          <AlertCircle className="h-14 w-14 mb-4" />
          <p>{getErrorMessage(error, 'Mehmonxonani yuklashda xatolik yuz berdi')}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="h-56 sm:h-64 bg-gradient-to-br from-blue-200 to-indigo-300 flex items-end">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 w-full">
          <FadeIn>
            <div className="flex items-center gap-1 text-yellow-400 mb-2">
              {[...Array(hotel.starRating)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{hotel.name}</h1>
            <div className="flex items-center gap-2 text-white/80 mt-1">
              <MapPin className="h-4 w-4" />
              <span className="text-sm sm:text-base">{hotel.address}, {hotel.city}, {hotel.country}</span>
            </div>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 w-full">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <FadeIn>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Mehmonxona haqida</h2>
              <p className="text-gray-600">{hotel.description || 'Tavsif mavjud emas.'}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Kirish: {hotel.checkInTime}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Chiqish: {hotel.checkOutTime}</span>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* All rooms with booking status */}
          {allRooms && allRooms.length > 0 && (
            <FadeIn delay={0.02}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Xonalar va band sanalar</h2>
                <div className="space-y-3">
                  {allRooms.map((room) => {
                    const ranges = bookedDates?.[room.id] || [];
                    return (
                      <div key={room.id} className="flex items-start sm:items-center justify-between gap-3 border border-gray-100 rounded-xl p-3">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">
                            Xona {room.roomNumber} — {room.roomType.name}
                          </p>
                          {ranges.length === 0 ? (
                            <p className="text-sm text-aura-emerald mt-1">Barcha sanalarda bo'sh</p>
                          ) : (
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              {ranges.map((r, i) => (
                                <span key={i} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">
                                  Band: {formatDate(r.checkInDate)} — {formatDate(r.checkOutDate)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  Yuqoridagi sanalardan tashqari kunlar uchun xona band qilishingiz mumkin.
                </p>
              </div>
            </FadeIn>
          )}

          {/* Available rooms */}
          {availableRooms && availableRooms.length > 0 && (
            <FadeIn delay={0.05}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Bo'sh xonalar</h2>
                <StaggerGroup className="space-y-4">
                  {availableRooms.map((room) => (
                    <StaggerItem key={room.id}>
                      <div
                        onClick={() => setSelectedRoom(room)}
                        className={`border rounded-xl p-4 cursor-pointer transition-all ${
                          selectedRoom?.id === room.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start sm:items-center justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              Xona {room.roomNumber} — {room.roomType.name}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {room.roomType.capacity} kishi
                              </span>
                              <span>Qavat: {room.floor}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {room.roomType.amenities?.slice(0, 3).map((a, i) => (
                                <span key={i} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                  <Wifi className="h-3 w-3" /> {a}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-lg sm:text-xl font-bold text-gray-900">
                              {formatCurrency(Number(room.roomType.basePrice))}
                            </p>
                            <p className="text-xs text-gray-500">kecha uchun</p>
                            {selectedRoom?.id === room.id && (
                              <span className="inline-flex items-center gap-1 text-blue-600 text-xs mt-1">
                                <Check className="h-3 w-3" /> Tanlangan
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              </div>
            </FadeIn>
          )}

          {/* Reviews */}
          {(hotel as Hotel & { reviews?: Array<{ id: string; rating: number; comment?: string; guest?: { firstName: string; lastName: string } }> }).reviews && (hotel as Hotel & { reviews?: Array<{ id: string; rating: number; comment?: string; guest?: { firstName: string; lastName: string } }> }).reviews!.length > 0 && (
            <FadeIn delay={0.1}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Sharhlar</h2>
                <div className="space-y-4">
                  {(hotel as Hotel & { reviews?: Array<{ id: string; rating: number; comment?: string; guest?: { firstName: string; lastName: string } }> }).reviews!.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
                          {review.guest?.firstName?.[0]}
                        </div>
                        <span className="font-medium text-gray-900">{review.guest?.firstName} {review.guest?.lastName}</span>
                        <div className="flex items-center gap-0.5 ml-auto text-yellow-400">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1">
          <FadeIn delay={0.05}>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:sticky lg:top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Xona band qilish</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kirish sanasi</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chiqish sanasi</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kattalar</label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} kishi</option>)}
                  </select>
                </div>

                {checkIn && checkOut && (
                  <button
                    onClick={() => refetchRooms()}
                    className="w-full border border-blue-600 text-blue-600 py-2.5 rounded-lg font-medium hover:bg-blue-50 active:scale-[0.99] transition-all"
                  >
                    Bo'sh xonalarni ko'rish
                  </button>
                )}

                <AnimatePresence>
                  {selectedRoom && nights > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-50 rounded-xl p-4 space-y-2 overflow-hidden"
                    >
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{formatCurrency(Number(selectedRoom.roomType.basePrice))} × {nights} kecha</span>
                        <span>{formatCurrency(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                        <span>Jami</span>
                        <span>{formatCurrency(totalPrice)}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {bookingError && (
                  <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{bookingError}</p>
                )}

                <button
                  onClick={handleBook}
                  disabled={bookMutation.isPending || !selectedRoom || !checkIn || !checkOut}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {bookMutation.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
                  Band qilish
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      <Footer />
    </div>
  );
}
