'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BedDouble, Wallet, CalendarDays, Search } from 'lucide-react';
import { PRICE_RANGES } from '../../lib/room-category';

export function RoomSearchBar() {
  const router = useRouter();
  const [roomType, setRoomType] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (roomType) params.set('type', roomType);
    if (price) params.set('price', price);
    if (date) params.set('date', date);
    router.push(`/rooms-select${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] gap-4 lg:items-end text-left">
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-aura-emerald-dark mb-1.5">
          <BedDouble className="h-3.5 w-3.5" />
          Qanday xona
        </label>
        <select
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-aura-emerald transition"
        >
          <option value="">Barcha xonalar</option>
          <option value="standart">Standart xonalar</option>
          <option value="premium">Premium xonalar</option>
          <option value="gold">Gold xonalar</option>
        </select>
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-aura-emerald-dark mb-1.5">
          <Wallet className="h-3.5 w-3.5" />
          Xona narxi
        </label>
        <select
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-aura-emerald transition"
        >
          <option value="">Barcha narxlar</option>
          {PRICE_RANGES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-aura-emerald-dark mb-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          Qachon
        </label>
        <input
          type="date"
          value={date}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-aura-emerald transition"
        />
      </div>

      <button
        onClick={handleSearch}
        className="flex items-center justify-center gap-2 bg-aura-emerald text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-aura-emerald-light active:scale-95 transition-all"
      >
        <Search className="h-4 w-4" />
        Qidiruvni boshlash
      </button>
    </div>
  );
}
