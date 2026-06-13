'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Star, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FadeIn } from '../../../components/motion/FadeIn';
import { reviewsService } from '../../../services/reviews.service';
import { cn } from '../../../lib/utils';
import { getErrorMessage } from '../../../lib/error-handler';

const CRITERIA = [
  { key: 'cleanlinessRating', label: 'Tozalik' },
  { key: 'serviceRating',     label: 'Xizmat' },
  { key: 'comfortRating',     label: 'Qulaylik' },
] as const;

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              'h-8 w-8 transition-colors',
              i <= (hovered || value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-200 fill-gray-200'
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default function NewReviewPage() {
  const router = useRouter();
  const params = useSearchParams();
  const bookingId = params.get('bookingId') || '';
  const hotelId = params.get('hotelId') || '';

  const [form, setForm] = useState({
    rating: 0,
    cleanlinessRating: 0,
    serviceRating: 0,
    comfortRating: 0,
    comment: '',
  });
  const [error, setError] = useState('');

  const submitMutation = useMutation({
    mutationFn: (body: typeof form & { bookingId: string; hotelId: string }) =>
      reviewsService.create(body),
    onSuccess: () => router.push('/bookings'),
    onError: (err: unknown) => setError(getErrorMessage(err, 'Xatolik yuz berdi')),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.rating === 0) { setError('Umumiy reyting qo\'ying'); return; }
    setError('');
    submitMutation.mutate({ ...form, bookingId, hotelId });
  };

  const LABEL = ['', 'Yomon', 'Qoniqarsiz', 'O\'rtacha', 'Yaxshi', 'A\'lo'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/bookings" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sharh qoldirish</h1>
            <p className="text-sm text-gray-500">Qoldirishingiz bizga yordam beradi</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall rating */}
          <FadeIn>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Umumiy baho</h2>
              <p className="text-sm text-gray-500 mb-5">Mehmonxonani umumiy baholang</p>
              <div className="flex justify-center mb-3">
                <StarInput value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
              </div>
              {form.rating > 0 && (
                <p className="text-lg font-semibold text-yellow-500">{LABEL[form.rating]}</p>
              )}
            </div>
          </FadeIn>

          {/* Sub ratings */}
          <FadeIn delay={0.05}>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Batafsil baho</h2>
              {CRITERIA.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-gray-700 w-24">{label}</span>
                  <StarInput
                    value={form[key]}
                    onChange={(v) => setForm({ ...form, [key]: v })}
                  />
                  {form[key] > 0 && (
                    <span className="text-xs text-gray-400 w-16">{LABEL[form[key]]}</span>
                  )}
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Comment */}
          <FadeIn delay={0.1}>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Izoh (ixtiyoriy)</h2>
              <textarea
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                rows={4}
                placeholder="Tajribangiz haqida yozing..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                maxLength={2000}
              />
              <p className="text-xs text-gray-400 text-right mt-1">{form.comment.length}/2000</p>
            </div>
          </FadeIn>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={submitMutation.isPending || form.rating === 0}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {submitMutation.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
            Sharh yuborish
          </motion.button>
        </form>
      </div>
    </div>
  );
}
