'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, CheckCircle, Trash2, Star, Clock, AlertCircle } from 'lucide-react';
import { FadeIn, StaggerGroup, StaggerItem } from '../../../components/motion/FadeIn';
import { adminReviewsService } from '../../../services/admin-reviews.service';
import { formatDate, cn } from '../../../lib/utils';
import { getErrorMessage } from '../../../lib/error-handler';

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['reviews', filter],
    queryFn: () => adminReviewsService.getAll({ limit: 50 }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminReviewsService.approve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminReviewsService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  });

  const reviews = (data || []).filter((r) => {
    const matchSearch =
      r.comment?.toLowerCase().includes(search.toLowerCase()) ||
      r.guest?.firstName?.toLowerCase().includes(search.toLowerCase());
    if (filter === 'pending') return !r.isApproved && matchSearch;
    if (filter === 'approved') return r.isApproved && matchSearch;
    return matchSearch;
  });

  const renderStars = (count: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn('h-3.5 w-3.5', i <= count ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200')}
        />
      ))}
    </div>
  );

  const pending = (data || []).filter((r) => !r.isApproved).length;

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <FadeIn>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sharhlar</h1>
            <p className="text-gray-500">Mehmon sharhlarini moderatsiya qiling</p>
          </div>
          {pending > 0 && (
            <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 w-fit">
              <Clock className="h-4 w-4" />
              {pending} ta kutmoqda
            </span>
          )}
        </div>
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={0.05}>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Izoh yoki mehmon ismi bo'yicha..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {(['all', 'pending', 'approved'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {f === 'all' ? 'Barchasi' : f === 'pending' ? 'Kutmoqda' : 'Tasdiqlangan'}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />)}
        </div>
      ) : isError ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 text-red-600">
          <AlertCircle className="h-12 w-12 mx-auto mb-3" />
          <p>{getErrorMessage(error, 'Sharhlarni yuklashda xatolik')}</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
          <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">Sharhlar topilmadi</p>
        </div>
      ) : (
        <StaggerGroup className="space-y-4">
          {reviews.map((review) => (
            <StaggerItem key={review.id}>
              <div
                className={cn(
                  'bg-white rounded-2xl p-5 shadow-sm border transition-all',
                  review.isApproved ? 'border-gray-100' : 'border-yellow-200 bg-yellow-50/30'
                )}
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  {/* Left: user + rating */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm shrink-0">
                      {review.guest?.firstName?.[0]}{review.guest?.lastName?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {review.guest?.firstName} {review.guest?.lastName}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                          <span className="text-sm font-bold text-gray-900 ml-1">{review.rating}/5</span>
                        </div>
                        {!review.isApproved && (
                          <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            Kutmoqda
                          </span>
                        )}
                        {review.isApproved && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            Tasdiqlangan
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!review.isApproved && (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => approveMutation.mutate(review.id)}
                        disabled={approveMutation.isPending}
                        className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Tasdiqlash
                      </motion.button>
                    )}
                    <button
                      onClick={() => { if (confirm('Sharhni o\'chirishni tasdiqlaysizmi?')) deleteMutation.mutate(review.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 leading-relaxed">
                    "{review.comment}"
                  </p>
                )}

                {/* Sub ratings */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { label: 'Tozalik', value: review.cleanlinessRating },
                    { label: 'Xizmat', value: review.serviceRating },
                    { label: 'Qulaylik', value: review.comfortRating },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center bg-gray-50 rounded-lg py-2">
                      <p className="text-xs text-gray-500">{label}</p>
                      <div className="flex justify-center mt-1">{renderStars(value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
