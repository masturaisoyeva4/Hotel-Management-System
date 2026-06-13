'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, X, Sparkles, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import { FadeIn, StaggerGroup, StaggerItem } from '../../../components/motion/FadeIn';
import { hotelServicesService, HotelServicePayload } from '../../../services/hotel-services.service';
import { formatCurrency } from '../../../lib/utils';
import { getErrorMessage } from '../../../lib/error-handler';

const CATEGORIES = ['restaurant', 'spa', 'transport', 'laundry', 'entertainment', 'fitness', 'business', 'other'];

const CATEGORY_COLORS: Record<string, string> = {
  restaurant: 'bg-orange-100 text-orange-700',
  spa: 'bg-pink-100 text-pink-700',
  transport: 'bg-blue-100 text-blue-700',
  laundry: 'bg-cyan-100 text-cyan-700',
  entertainment: 'bg-purple-100 text-purple-700',
  fitness: 'bg-green-100 text-green-700',
  business: 'bg-gray-100 text-gray-700',
  other: 'bg-yellow-100 text-yellow-700',
};

const emptyForm: HotelServicePayload = { hotelId: '', name: '', description: '', category: 'restaurant', price: 0 };

export default function AdminServicesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [form, setForm] = useState<HotelServicePayload>(emptyForm);
  const [formError, setFormError] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['services', categoryFilter],
    queryFn: () => hotelServicesService.getAll({ limit: 50, category: categoryFilter || undefined }),
  });

  const services = (data || []).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: (body: HotelServicePayload) => hotelServicesService.create(body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['services'] }); closeModal(); },
    onError: (err) => setFormError(getErrorMessage(err, 'Xizmatni qo\'shishda xatolik')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<HotelServicePayload> }) =>
      hotelServicesService.update(id, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['services'] }); closeModal(); },
    onError: (err) => setFormError(getErrorMessage(err, 'Saqlashda xatolik')),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      hotelServicesService.update(id, { isAvailable }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => hotelServicesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });

  const openCreate = () => { setForm(emptyForm); setFormError(''); setModal('create'); };
  const openEdit = (s: any) => {
    setSelected(s);
    setForm({ hotelId: s.hotelId, name: s.name, description: s.description || '', category: s.category, price: s.price });
    setFormError('');
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal === 'create') createMutation.mutate(form);
    else if (modal === 'edit' && selected) updateMutation.mutate({ id: selected.id, body: form });
  };

  return (
    <div className="p-4 sm:p-6">
      <FadeIn>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Xizmatlar</h1>
            <p className="text-gray-500">Mehmonxona xizmatlarini boshqaring</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={openCreate}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Xizmat qo'shish
          </motion.button>
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
              placeholder="Xizmat nomi bo'yicha..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="">Barcha kategoriyalar</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </FadeIn>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-36 animate-pulse" />)}
        </div>
      ) : isError ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 text-red-600">
          <AlertCircle className="h-12 w-12 mx-auto mb-3" />
          <p>{getErrorMessage(error, 'Xizmatlarni yuklashda xatolik')}</p>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
          <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">Xizmatlar topilmadi</p>
        </div>
      ) : (
        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <StaggerItem key={service.id}>
              <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${!service.isAvailable ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${CATEGORY_COLORS[service.category] || 'bg-gray-100 text-gray-700'}`}>
                      {service.category}
                    </span>
                    <h3 className="font-semibold text-gray-900 truncate">{service.name}</h3>
                    {service.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(service.price)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleMutation.mutate({ id: service.id, isAvailable: !service.isAvailable })}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title={service.isAvailable ? 'O\'chirish' : 'Yoqish'}
                    >
                      {service.isAvailable
                        ? <ToggleRight className="h-5 w-5 text-green-500" />
                        : <ToggleLeft className="h-5 w-5 text-gray-400" />}
                    </button>
                    <button onClick={() => openEdit(service)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { if (confirm('Xizmatni o\'chirishni tasdiqlaysizmi?')) deleteMutation.mutate(service.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">
                  {modal === 'create' ? 'Xizmat qo\'shish' : 'Xizmatni tahrirlash'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                    {formError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hotel ID</label>
                  <input value={form.hotelId} onChange={(e) => setForm({ ...form, hotelId: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Xizmat nomi</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Breakfast" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategoriya</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Narx ($)</label>
                  <input type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Bekor</button>
                  <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {modal === 'create' ? 'Qo\'shish' : 'Saqlash'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
