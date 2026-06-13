export type RoomCategory = 'standart' | 'premium' | 'gold';

export const ROOM_CATEGORY_LABELS: Record<RoomCategory, string> = {
  standart: 'Standart',
  premium: 'Premium',
  gold: 'Gold',
};

export const ROOM_CATEGORY_COLORS: Record<
  RoomCategory,
  { bg: string; text: string; border: string; selectedBg: string; selectedText: string }
> = {
  standart: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-300',
    selectedBg: 'bg-aura-emerald',
    selectedText: 'text-white',
  },
  premium: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-300',
    selectedBg: 'bg-aura-emerald',
    selectedText: 'text-white',
  },
  gold: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-aura-gold/60',
    selectedBg: 'bg-aura-emerald',
    selectedText: 'text-white',
  },
};

/** Maps a backend room type name (Standard / Deluxe / Suite ...) to an AURA room category. */
export function getRoomCategory(roomTypeName: string): RoomCategory {
  const name = roomTypeName.toLowerCase();
  if (name.includes('suite') || name.includes('gold')) return 'gold';
  if (name.includes('deluxe') || name.includes('premium')) return 'premium';
  return 'standart';
}

export const PRICE_RANGES: { value: string; label: string; min: number; max?: number }[] = [
  { value: '0-100', label: "$0 - $100", min: 0, max: 100 },
  { value: '100-200', label: "$100 - $200", min: 100, max: 200 },
  { value: '200-plus', label: "$200+", min: 200 },
];
