'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Hotel, BedDouble, Menu, X, LogOut, User as UserIcon, Calendar, BookOpen, Sparkles, PackageOpen } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

const guestLinks = [
  { href: '/rooms-select', label: 'Xona tanlash', icon: BedDouble },
  { href: '/services', label: 'Xizmatlar', icon: Sparkles },
  { href: '/my-services', label: 'Xizmatlarim', icon: PackageOpen },
  { href: '/bookings', label: 'Bronlarim', icon: Calendar },
  { href: '/dashboard', label: 'Dashboard', icon: BookOpen },
];

const publicLinks = [
  { href: '/rooms-select', label: 'Xona tanlash' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const isGuestUser = !!user && user.role === 'guest';

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push('/auth/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Hotel className="h-7 w-7 text-aura-emerald" />
            <span className="text-xl font-bold text-aura-emerald-dark tracking-wide">
              AURA
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {(isGuestUser ? guestLinks : publicLinks).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-aura-emerald bg-aura-emerald/10'
                    : 'text-gray-600 hover:text-aura-emerald hover:bg-gray-50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-2">
            {isGuestUser ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-aura-emerald/10 flex items-center justify-center text-aura-emerald font-semibold text-xs">
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.firstName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Chiqish
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-600 hover:text-aura-emerald px-4 py-2 transition-colors"
                >
                  Kirish
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-aura-emerald text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-aura-emerald-light transition-colors"
                >
                  Ro'yxatdan o'tish
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Menyu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {(isGuestUser ? guestLinks : publicLinks).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'text-aura-emerald bg-aura-emerald/10'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {'icon' in link && <link.icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              ))}

              {isGuestUser ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <UserIcon className="h-4 w-4" />
                    Profil ({user.firstName})
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Chiqish
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setOpen(false)}
                    className="text-center text-sm font-medium text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Kirish
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setOpen(false)}
                    className="text-center bg-aura-emerald text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-aura-emerald-light transition-colors"
                  >
                    Ro'yxatdan o'tish
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
