'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  UtensilsCrossed, Sparkles, Car, Shirt, Music, Dumbbell, Briefcase, MoreHorizontal,
  AlertCircle, PackageOpen,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { FadeIn, StaggerGroup, StaggerItem } from '../../components/motion/FadeIn';
import { hotelServicesService } from '../../services/hotel-services.service';
import { BookingService } from '../../types';
import { formatCurrency, formatDate, BOOKING_STATUS_COLORS } from '../../lib/utils';
import { getErrorMessage } from '../../lib/error-handler';

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

const STATUS_LABELS: Record<string, string> = {
  pending: 'Kutilmoqda',
  confirmed: 'Tasdiqlangan',
  checked_in: 'Kirilgan',
  checked_out: 'Chiqilgan',
  cancelled: 'Bekor qilingan',
};

export default function MyServicesPage() {
  const { data: bookedServices, isLoading, isError, error } = useQuery<BookingService[]>({
    queryKey: ['my-booked-services'],
    queryFn: () => hotelServicesService.getMine(),
  });

  const total = (bookedServices || []).reduce((sum, bs) => sum + Number(bs.price), 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-aura-emerald-dark mb-1">Xizmatlarim</h1>
              <p className="text-gray-500 text-sm">
                Bronlaringizga qo'shilgan xizmatlar ro'yxati.
              </p>
            </div>
            <Link
              href="/services"
              className="bg-aura-emerald text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-aura-emerald-light active:scale-95 transition-all shrink-0 text-center"
            >
              Yangi xizmat qo'shish
            </Link>
          </div>
        </FadeIn>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-red-600">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p>{getErrorMessage(error, 'Xizmatlarni yuklashda xatolik')}</p>
          </div>
        ) : !bookedServices || bookedServices.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <PackageOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="mb-4">Hozircha buyurtma qilingan xizmatlar yo'q</p>
            <Link
              href="/services"
              className="inline-block bg-aura-emerald text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-aura-emerald-light active:scale-95 transition-all"
            >
              Xizmatlarni ko'rish
            </Link>
          </div>
        ) : (
          <>
            <StaggerGroup className="space-y-4">
              {bookedServices.map((bs) => {
                const Icon = CATEGORY_ICONS[bs.service.category] || MoreHorizontal;
                const statusColor = BOOKING_STATUS_COLORS[bs.booking.status] || 'bg-gray-100 text-gray-700';
                return (
                  <StaggerItem key={bs.id}>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-aura-emerald/10 flex items-center justify-center shrink-0">
                        <Icon className="h-6 w-6 text-aura-emerald" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold uppercase tracking-wide text-aura-gold-dark">
                            {CATEGORY_LABELS[bs.service.category] || bs.service.category}
                          </span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
                            {STATUS_LABELS[bs.booking.status] || bs.booking.status}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 truncate">{bs.service.name}</h3>
                        <p className="text-sm text-gray-500">
                          Bron #{bs.booking.bookingNumber} · {formatDate(bs.booking.checkInDate)} —{' '}
                          {formatDate(bs.booking.checkOutDate)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-aura-emerald-dark">{formatCurrency(Number(bs.price))}</p>
                        <p className="text-xs text-gray-400">{bs.quantity} x {formatCurrency(Number(bs.service.price))}</p>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>

            <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-gray-700">Jami</span>
              <span className="text-xl font-bold text-aura-emerald-dark">{formatCurrency(total)}</span>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
