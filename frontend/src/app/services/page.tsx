'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  UtensilsCrossed, Sparkles, Car, Shirt, Music, Dumbbell, Briefcase, MoreHorizontal,
  X, CheckCircle2, AlertCircle, Loader2, CreditCard,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { FadeIn, StaggerGroup, StaggerItem } from '../../components/motion/FadeIn';
import { PaymentModal } from '../../components/payment/PaymentModal';
import { hotelServicesService } from '../../services/hotel-services.service';
import { bookingsService } from '../../services/bookings.service';
import { Service, Booking } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { getErrorMessage } from '../../lib/error-handler';
import { useAuthStore } from '../../store/authStore';

const CATEGORY_LABELS: Record<string, string> = {
  restaurant: 'Restoran',
  spa: 'Spa',
  transport: 'Transport',
  laundry: 'Kir yuvish',
  entertainment: "Ko'ngilochar",
  fitness: 'Fitnes',
  business: 'Biznes',
  other: 'Boshqa',
};

const CATEGORY_ICONS: Record<string, typeof UtensilsCrossed> = {
  restaurant: UtensilsCrossed,
  spa: Sparkles,
  transport: Car,
  laundry: Shirt,
  entertainment: Music,
  fitness: Dumbbell,
  business: Briefcase,
  other: MoreHorizontal,
};

const ACTIVE_STATUSES = ['pending', 'confirmed', 'checked_in'];

export default function ServicesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);
  const [showPaySelector, setShowPaySelector] = useState(false);

  const { data: services, isLoading, isError, error } = useQuery<Service[]>({
    queryKey: ['hotel-services'],
    queryFn: () => hotelServicesService.getAll({ limit: 100 }),
  });

  const { data: bookingsData } = useQuery({
    queryKey: ['my-bookings-for-services'],
    queryFn: () => bookingsService.getAll({ limit: 50 }),
    enabled: !!user,
  });

  const activeBookings = useMemo<Booking[]>(() => {
    return (bookingsData?.data || []).filter((b) => ACTIVE_STATUSES.includes(b.status));
  }, [bookingsData]);

  const addMutation = useMutation({
    mutationFn: () => hotelServicesService.addToBooking(selectedBookingId, selectedService!.id, quantity),
    onSuccess: () => {
      setSuccessMsg(`"${selectedService?.name}" xizmati bronga qo'shildi.`);
      const booking = activeBookings.find((b) => b.id === selectedBookingId);
      if (booking && selectedService) {
        setPayingBooking({
          ...booking,
          totalPrice: Number(booking.totalPrice) + Number(selectedService.price) * quantity,
        });
      }
      setSelectedService(null);
      setSelectedBookingId('');
      setQuantity(1);
      queryClient.invalidateQueries({ queryKey: ['my-bookings-for-services'] });
    },
    onError: (err: unknown) => setErrorMsg(getErrorMessage(err, "Xizmatni qo'shishda xatolik")),
  });

  const openBookingModal = (service: Service) => {
    setErrorMsg('');
    setSelectedService(service);
    setSelectedBookingId(activeBookings[0]?.id || '');
    setQuantity(1);
  };

  const handleConfirm = () => {
    setErrorMsg('');
    if (!selectedBookingId) {
      setErrorMsg('Avval faol bron tanlang');
      return;
    }
    addMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-aura-emerald-dark mb-1">Mehmonxona xizmatlari</h1>
              <p className="text-gray-500 text-sm">
                Qo'shimcha xizmatlarni ko'ring va o'zingiz tanlagan bronga qo'shing.
              </p>
            </div>
            {user && (
              <button
                onClick={() => setShowPaySelector(true)}
                className="bg-aura-emerald text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-aura-emerald-light active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <CreditCard className="h-4 w-4" />
                To'lovni amalga oshirish
              </button>
            )}
          </div>
        </FadeIn>

        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-3 text-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                {successMsg}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-red-600">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p>{getErrorMessage(error, 'Xizmatlarni yuklashda xatolik')}</p>
          </div>
        ) : !services || services.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Hozircha xizmatlar mavjud emas</p>
          </div>
        ) : (
          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service) => {
              const Icon = CATEGORY_ICONS[service.category] || MoreHorizontal;
              return (
                <StaggerItem key={service.id}>
                  <div className="h-full bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    <div className="h-12 w-12 rounded-xl bg-aura-emerald/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-aura-emerald" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-aura-gold-dark mb-1">
                      {CATEGORY_LABELS[service.category] || service.category}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                    {service.description && (
                      <p className="text-gray-500 text-sm mb-4 flex-1">{service.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <span className="text-xl font-bold text-aura-emerald-dark">
                        {formatCurrency(Number(service.price))}
                      </span>
                      <button
                        onClick={() => (user ? openBookingModal(service) : undefined)}
                        className="bg-aura-emerald text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-aura-emerald-light active:scale-95 transition-all"
                      >
                        {user ? 'Band qilish' : 'Kirish kerak'}
                      </button>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        )}
      </div>

      <Footer />

      {/* Booking modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">{selectedService.name}</h2>
                <button onClick={() => setSelectedService(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-aura-emerald-dark font-bold text-xl mb-4">
                {formatCurrency(Number(selectedService.price))} <span className="text-sm text-gray-400 font-normal">/ dona</span>
              </p>

              {activeBookings.length === 0 ? (
                <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                  Sizda faol bron mavjud emas. Xizmatni qo'shish uchun avval xona band qiling.
                </p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bronni tanlang</label>
                    <select
                      value={selectedBookingId}
                      onChange={(e) => setSelectedBookingId(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-aura-emerald"
                    >
                      {activeBookings.map((b) => (
                        <option key={b.id} value={b.id}>
                          #{b.bookingNumber} — {b.room ? `Xona ${b.room.roomNumber}` : ''} ({b.checkInDate.slice(0, 10)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Miqdori</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(50, Number(e.target.value))))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-aura-emerald"
                    />
                  </div>

                  <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-100">
                    <span className="text-gray-600">Jami</span>
                    <span className="text-aura-emerald-dark font-bold">
                      {formatCurrency(Number(selectedService.price) * quantity)}
                    </span>
                  </div>
                </div>
              )}

              {errorMsg && (
                <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg mt-4">{errorMsg}</p>
              )}

              <button
                onClick={handleConfirm}
                disabled={addMutation.isPending || activeBookings.length === 0}
                className="w-full mt-5 bg-aura-emerald text-white py-3 rounded-xl font-semibold hover:bg-aura-emerald-light active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {addMutation.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
                Tasdiqlash
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking selector for direct payment */}
      <AnimatePresence>
        {showPaySelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPaySelector(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">To'lov uchun bronni tanlang</h2>
                <button onClick={() => setShowPaySelector(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {activeBookings.length === 0 ? (
                <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                  Sizda faol bron mavjud emas.
                </p>
              ) : (
                <div className="space-y-2">
                  {activeBookings.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setShowPaySelector(false);
                        setPayingBooking(b);
                      }}
                      className="w-full flex items-center justify-between text-left border border-gray-200 rounded-xl px-4 py-3 hover:border-aura-emerald hover:bg-aura-emerald/5 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">#{b.bookingNumber}</p>
                        <p className="text-xs text-gray-500">{b.room ? `Xona ${b.room.roomNumber}` : ''} · {b.checkInDate.slice(0, 10)}</p>
                      </div>
                      <span className="font-bold text-aura-emerald-dark">{formatCurrency(Number(b.totalPrice))}</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {payingBooking && (
        <PaymentModal
          bookingId={payingBooking.id}
          orderNumber={payingBooking.bookingNumber}
          title={payingBooking.hotel?.name || "Mehmonxona xizmati uchun to'lov"}
          subtitle={payingBooking.room ? `Xona ${payingBooking.room.roomNumber}` : undefined}
          amount={Number(payingBooking.totalPrice)}
          onClose={() => setPayingBooking(null)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['my-bookings-for-services'] })}
        />
      )}
    </div>
  );
}
