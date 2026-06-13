'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, Hotel, ChevronRight, User, AlertCircle } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { FadeIn, StaggerGroup, StaggerItem } from '../../components/motion/FadeIn';
import { bookingsService } from '../../services/bookings.service';
import { useAuthStore } from '../../store/authStore';
import { formatDate, formatCurrency, BOOKING_STATUS_COLORS, cn } from '../../lib/utils';
import { getErrorMessage } from '../../lib/error-handler';

export default function GuestDashboard() {
  const router = useRouter();
  const { user, hasHydrated } = useAuthStore();

  // Redirect non-guests to admin panel
  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) { router.replace('/auth/login'); return; }
    if (user.role !== 'guest') router.replace('/admin/dashboard');
  }, [user, hasHydrated, router]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-bookings-dashboard'],
    queryFn: () => bookingsService.getAll({ limit: 5 }).then((r) => r.data),
    enabled: !!user,
  });

  const bookings = data || [];
  const activeBookings = bookings.filter((b) => ['confirmed', 'checked_in'].includes(b.status));

  if (!hasHydrated || !user || user.role !== 'guest') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-8 w-8 border-4 border-aura-emerald border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome banner */}
        <FadeIn>
          <div className="bg-gradient-to-r from-aura-emerald to-aura-emerald-dark rounded-2xl p-6 sm:p-8 mb-8 text-white shadow-lg shadow-aura-emerald/20">
            <h2 className="text-xl sm:text-2xl font-bold mb-1">Xush kelibsiz, {user.firstName}! 👋</h2>
            <p className="text-aura-cream/90">Bronlaringiz va xizmatlaringizni bu yerdan boshqaring</p>
            <Link
              href="/rooms-select"
              className="inline-flex items-center gap-2 mt-4 bg-aura-gold text-aura-emerald-dark px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-aura-gold-light active:scale-95 transition-all"
            >
              Xona band qilish <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeIn>

        {/* Stats */}
        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Jami bronlar', value: bookings.length, icon: BookOpen, color: 'bg-aura-emerald', href: '/bookings' },
            { label: 'Faol bronlar', value: activeBookings.length, icon: Calendar, color: 'bg-aura-gold-dark', href: '/bookings?status=confirmed' },
            { label: 'Profil', value: "Ko'rish", icon: User, color: 'bg-aura-emerald-light', href: '/profile' },
          ].map((item, i) => (
            <StaggerItem key={i}>
              <Link href={item.href}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-aura-emerald/30 transition-all cursor-pointer"
                >
                  <div className={`${item.color} p-3 rounded-xl w-fit mb-3`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
                </motion.div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* Quick actions */}
        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { href: '/rooms-select', label: 'Xona tanlash', desc: 'Yangi xona bron qiling', bg: 'bg-aura-emerald hover:bg-aura-emerald-light text-white' },
            { href: '/bookings', label: 'Mening bronlarim', desc: "Barcha bronlarni ko'rish", bg: 'bg-white hover:shadow-md border border-gray-200 text-gray-900' },
            { href: '/profile', label: 'Profil sozlamalari', desc: "Ma'lumotlar va parol", bg: 'bg-white hover:shadow-md border border-gray-200 text-gray-900' },
          ].map((action, i) => (
            <StaggerItem key={i}>
              <Link href={action.href}>
                <motion.div whileHover={{ y: -4 }} className={`rounded-2xl p-5 transition-all cursor-pointer ${action.bg}`}>
                  <h3 className="font-semibold mb-1">{action.label}</h3>
                  <p className={`text-sm ${action.bg.includes('aura-emerald') ? 'text-aura-cream/90' : 'text-gray-500'}`}>
                    {action.desc}
                  </p>
                </motion.div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* Recent bookings */}
        <FadeIn delay={0.1}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">So'nggi bronlar</h3>
              <Link href="/bookings" className="text-aura-emerald text-sm hover:underline flex items-center gap-1">
                Barchasi <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {isLoading ? (
              <div className="px-6 py-14 flex justify-center">
                <div className="h-6 w-6 border-2 border-aura-emerald border-t-transparent rounded-full animate-spin" />
              </div>
            ) : isError ? (
              <div className="px-6 py-14 text-center text-red-600">
                <AlertCircle className="h-10 w-10 mx-auto mb-3" />
                <p>{getErrorMessage(error, 'Bronlarni yuklashda xatolik yuz berdi')}</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 mb-4">Hali bronlar yo'q</p>
                <Link
                  href="/rooms-select"
                  className="inline-flex bg-aura-emerald text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-aura-emerald-light transition-colors"
                >
                  Birinchi broningizni qiling
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {bookings.map((booking) => (
                  <Link key={booking.id} href="/bookings">
                    <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-aura-emerald/10 flex items-center justify-center">
                          <Hotel className="h-5 w-5 text-aura-emerald" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{booking.hotel?.name}</p>
                          <p className="text-sm text-gray-500 truncate">
                            {formatDate(booking.checkInDate)} — {formatDate(booking.checkOutDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-gray-900">{formatCurrency(booking.totalPrice)}</p>
                        <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium mt-1', BOOKING_STATUS_COLORS[booking.status])}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
