import Link from 'next/link';
import { Hotel } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-aura-emerald-dark text-aura-cream/70 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white">
          <Hotel className="h-5 w-5 text-aura-gold" />
          <span className="font-semibold tracking-wide">AURA</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link href="/rooms-select" className="hover:text-aura-gold-light transition-colors">
            Xona tanlash
          </Link>
          <Link href="/auth/login" className="hover:text-aura-gold-light transition-colors">
            Kirish
          </Link>
          <Link href="/auth/register" className="hover:text-aura-gold-light transition-colors">
            Ro'yxatdan o'tish
          </Link>
        </nav>
        <p className="text-sm">&copy; {new Date().getFullYear()} AURA. Barcha huquqlar himoyalangan.</p>
      </div>
    </footer>
  );
}
