'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BedDouble, Wallet, CalendarDays, AlertCircle, ArrowRight, Building2 } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { FadeIn, StaggerGroup, StaggerItem } from '../../components/motion/FadeIn';
import { roomsService, BookedDateRange } from '../../services/rooms.service';
import { Room } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { getErrorMessage } from '../../lib/error-handler';
import {
  getRoomCategory,
  ROOM_CATEGORY_LABELS,
  ROOM_CATEGORY_COLORS,
  PRICE_RANGES,
  RoomCategory,
} from '../../lib/room-category';

export default function RoomsSelectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeFilter = searchParams.get('type') as RoomCategory | null;
  const priceFilter = searchParams.get('price');
  const dateParam = searchParams.get('date') || '';

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['rooms-select'],
    queryFn: () => roomsService.getAll({ limit: 100 }).then((r) => r.data),
  });

  const rooms = data || [];

  const hotelIds = useMemo(() => Array.from(new Set(rooms.map((r) => r.hotelId))), [rooms]);

  const { data: bookedDatesData } = useQuery({
    queryKey: ['rooms-booked-dates', hotelIds],
    queryFn: async () => {
      const results = await Promise.all(hotelIds.map((hotelId) => roomsService.getBookedDates(hotelId)));
      return results.reduce((acc, cur) => ({ ...acc, ...cur }), {} as Record<string, BookedDateRange[]>);
    },
    enabled: hotelIds.length > 0,
  });

  const bookedDates = bookedDatesData || {};

  // If a date is chosen, treat it as a 1-night stay for availability checks
  const selectedRange = useMemo(() => {
    if (!dateParam) return null;
    const checkIn = new Date(dateParam);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 1);
    return { checkIn, checkOut };
  }, [dateParam]);

  const isRoomBookedOnDate = (roomId: string) => {
    if (!selectedRange) return false;
    return (bookedDates[roomId] || []).some((r) => {
      const rIn = new Date(r.checkInDate);
      const rOut = new Date(r.checkOutDate);
      return rIn < selectedRange.checkOut && rOut > selectedRange.checkIn;
    });
  };

  const filteredRooms = useMemo(() => {
    const priceRange = PRICE_RANGES.find((r) => r.value === priceFilter);
    return rooms.filter((room) => {
      const category = getRoomCategory(room.roomType.name);
      if (typeFilter && category !== typeFilter) return false;
      if (priceRange) {
        const price = Number(room.roomType.basePrice);
        if (price < priceRange.min) return false;
        if (priceRange.max !== undefined && price >= priceRange.max) return false;
      }
      return true;
    });
  }, [rooms, typeFilter, priceFilter]);

  const handleNext = () => {
    if (!selectedRoom) return;
    const params = new URLSearchParams();
    if (dateParam) params.set('checkIn', dateParam);
    router.push(`/hotels/${selectedRoom.hotelId}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        <FadeIn>
          <h1 className="text-2xl font-bold text-aura-emerald-dark mb-1">Xona tanlash</h1>
          <p className="text-gray-500 text-sm mb-6">
            Quyidagi jadvaldan o'zingizga mos xonani tanlang.
          </p>
        </FadeIn>

        {/* Active filters summary */}
        <FadeIn delay={0.05}>
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600">
              <BedDouble className="h-4 w-4 text-aura-emerald" />
              {typeFilter ? ROOM_CATEGORY_LABELS[typeFilter] : 'Barcha xonalar'}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600">
              <Wallet className="h-4 w-4 text-aura-emerald" />
              {priceFilter ? PRICE_RANGES.find((r) => r.value === priceFilter)?.label : 'Barcha narxlar'}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600">
              <CalendarDays className="h-4 w-4 text-aura-emerald" />
              {dateParam || 'Sana tanlanmagan'}
            </span>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Rooms grid */}
          <div className="lg:col-span-2">
            <FadeIn delay={0.1}>
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                {isLoading ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {[...Array(15)].map((_, i) => (
                      <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                ) : isError ? (
                  <div className="text-center py-16 text-red-600">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                    <p>{getErrorMessage(error, 'Xonalarni yuklashda xatolik')}</p>
                  </div>
                ) : filteredRooms.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <BedDouble className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Mos xonalar topilmadi</p>
                  </div>
                ) : (
                  <>
                    <StaggerGroup className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {filteredRooms.map((room) => {
                        const category = getRoomCategory(room.roomType.name);
                        const colors = ROOM_CATEGORY_COLORS[category];
                        const roomRanges = bookedDates[room.id] || [];
                        const bookedForDate = isRoomBookedOnDate(room.id);
                        const isAvailable = room.status === 'available' && !bookedForDate;
                        const isSelected = selectedRoom?.id === room.id;
                        const title = roomRanges.length
                          ? `Band sanalar: ${roomRanges
                              .map((r) => `${formatDate(r.checkInDate)} – ${formatDate(r.checkOutDate)}`)
                              .join(', ')}`
                          : undefined;

                        return (
                          <StaggerItem key={room.id}>
                            <button
                              type="button"
                              disabled={!isAvailable}
                              title={title}
                              onClick={() => setSelectedRoom(room)}
                              className={`w-full aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                                !isAvailable
                                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                  : isSelected
                                  ? `${colors.selectedBg} ${colors.selectedText} border-aura-emerald-dark scale-105 shadow-lg`
                                  : `${colors.bg} ${colors.text} ${colors.border} hover:scale-105 hover:shadow-md cursor-pointer`
                              }`}
                            >
                              <BedDouble className="h-5 w-5" />
                              <span className="text-sm font-bold">{room.roomNumber}</span>
                              {!isAvailable && roomRanges.length > 0 && (
                                <span className="text-[10px] leading-tight text-center px-1">
                                  Band: {formatDate(roomRanges[0].checkOutDate)}gacha
                                </span>
                              )}
                            </button>
                          </StaggerItem>
                        );
                      })}
                    </StaggerGroup>

                    {/* Legend */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-4 sm:gap-6 text-xs text-gray-600">
                      {(['standart', 'premium', 'gold'] as RoomCategory[]).map((cat) => (
                        <div key={cat} className="flex items-center gap-2">
                          <span className={`h-4 w-4 rounded ${ROOM_CATEGORY_COLORS[cat].bg} border ${ROOM_CATEGORY_COLORS[cat].border}`} />
                          {ROOM_CATEGORY_LABELS[cat]}
                        </div>
                      ))}
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded bg-gray-100 border border-gray-200" />
                        Band (sichqonchani ustiga olib borib sanani ko'ring)
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded bg-aura-emerald border border-aura-emerald-dark" />
                        Tanlangan
                      </div>
                    </div>
                  </>
                )}
              </div>
            </FadeIn>
          </div>

          {/* Summary panel */}
          <div className="lg:col-span-1">
            <FadeIn delay={0.15}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:sticky lg:top-24">
                <h2 className="text-lg font-bold text-aura-emerald-dark mb-4">Tanlangan xona</h2>

                {selectedRoom ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1.5">
                        <Building2 className="h-4 w-4" /> Xona raqami
                      </span>
                      <span className="font-semibold text-gray-900">{selectedRoom.roomNumber}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Turi</span>
                      <span className="font-semibold text-gray-900">
                        {ROOM_CATEGORY_LABELS[getRoomCategory(selectedRoom.roomType.name)]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Qavat</span>
                      <span className="font-semibold text-gray-900">{selectedRoom.floor}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Sana</span>
                      <span className="font-semibold text-gray-900">{dateParam || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-gray-700 font-medium">1 kecha narxi</span>
                      <span className="text-xl font-bold text-aura-emerald-dark">
                        {formatCurrency(Number(selectedRoom.roomType.basePrice))}
                      </span>
                    </div>

                    {(bookedDates[selectedRoom.id] || []).length > 0 && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Band qilingan sanalar</p>
                        <ul className="space-y-1">
                          {(bookedDates[selectedRoom.id] || []).map((r, i) => (
                            <li key={i} className="text-xs text-red-600 bg-red-50 rounded-lg px-2.5 py-1.5">
                              {formatDate(r.checkInDate)} — {formatDate(r.checkOutDate)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Davom etish uchun chap tomondagi jadvaldan bo'sh xonani tanlang.
                  </p>
                )}

                <button
                  onClick={handleNext}
                  disabled={!selectedRoom}
                  className="w-full mt-6 bg-aura-emerald text-white py-3 rounded-xl font-semibold hover:bg-aura-emerald-light active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  Keyingi
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
