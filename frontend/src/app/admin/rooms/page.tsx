'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, X, BedDouble, AlertCircle } from 'lucide-react';
import { FadeIn } from '../../../components/motion/FadeIn';
import { adminRoomsService, RoomPayload } from '../../../services/admin-rooms.service';
import { cn, ROOM_STATUS_COLORS } from '../../../lib/utils';
import { getErrorMessage } from '../../../lib/error-handler';

const STATUS_OPTIONS = ['available', 'occupied', 'maintenance', 'cleaning'] as const;

const emptyForm: RoomPayload = {
  hotelId: '',
  roomNumber: '',
  roomTypeId: '',
  floor: 1,
};

export default function AdminRoomsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | 'status' | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [form, setForm] = useState<RoomPayload>(emptyForm);
  const [newStatus, setNewStatus] = useState('');
  const [formError, setFormError] = useState('');

  // ── Data ──────────────────────────────────────────────
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-rooms', statusFilter],
    queryFn: () => adminRoomsService.getAll({ limit: 50, status: statusFilter || undefined }),
  });

  const rooms = (data || []).filter((r) =>
    r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.roomType?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Mutations ─────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (body: RoomPayload) => adminRoomsService.create(body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-rooms'] }); closeModal(); },
    onError: (err) => setFormError(getErrorMessage(err, 'Xonani qo\'shishda xatolik')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<RoomPayload> }) =>
      adminRoomsService.update(id, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-rooms'] }); closeModal(); },
    onError: (err) => setFormError(getErrorMessage(err, 'Xonani saqlashda xatolik')),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminRoomsService.updateStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-rooms'] }); closeModal(); },
    onError: (err) => setFormError(getErrorMessage(err, 'Holatni o\'zgartirishda xatolik')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminRoomsService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-rooms'] }),
  });

  // ── Helpers ───────────────────────────────────────────
  const openCreate = () => { setForm(emptyForm); setFormError(''); setModal('create'); };
  const openEdit = (r: any) => {
    setSelected(r);
    setForm({ hotelId: r.hotelId, roomNumber: r.roomNumber, roomTypeId: r.roomType.id, floor: r.floor });
    setFormError('');
    setModal('edit');
  };
  const openStatus = (r: any) => { setSelected(r); setNewStatus(r.status); setFormError(''); setModal('status'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal === 'create') createMutation.mutate(form);
    else if (modal === 'edit' && selected) updateMutation.mutate({ id: selected.id, body: form });
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <FadeIn>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Xonalar</h1>
            <p className="text-gray-500">Barcha xonalarni boshqaring</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={openCreate}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Yangi xona
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
              placeholder="Xona raqami yoki tur bo'yicha..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="">Barcha holatlar</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </FadeIn>

      {/* Table */}
      <FadeIn delay={0.1}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Xona №', 'Tur', 'Qavat', 'Sig\'im', 'Narx/kecha', 'Holat', 'Amallar'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">Yuklanmoqda...</td></tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-red-600">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      {getErrorMessage(error, 'Xonalarni yuklashda xatolik')}
                    </td>
                  </tr>
                ) : rooms.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <BedDouble className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-gray-400">Xonalar topilmadi</p>
                    </td>
                  </tr>
                ) : rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{room.roomNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{room.roomType?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{room.floor}-qavat</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{room.roomType?.capacity} kishi</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">${room.roomType?.basePrice}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openStatus(room)}
                        className={cn('inline-flex px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 whitespace-nowrap', ROOM_STATUS_COLORS[room.status])}
                      >
                        {room.status}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(room)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { if (confirm('Xonani o\'chirishni tasdiqlaysizmi?')) deleteMutation.mutate(room.id); }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {(modal === 'create' || modal === 'edit') && (
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
                  {modal === 'create' ? 'Yangi xona qo\'shish' : 'Xonani tahrirlash'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                    {formError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hotel ID</label>
                  <input
                    value={form.hotelId}
                    onChange={(e) => setForm({ ...form, hotelId: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="Hotel UUID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Xona raqami</label>
                  <input
                    value={form.roomNumber}
                    onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="101"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type ID</label>
                  <input
                    value={form.roomTypeId}
                    onChange={(e) => setForm({ ...form, roomTypeId: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="RoomType UUID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qavat</label>
                  <input
                    type="number"
                    min={1}
                    value={form.floor}
                    onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                    Bekor qilish
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {modal === 'create' ? 'Qo\'shish' : 'Saqlash'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Modal */}
      <AnimatePresence>
        {modal === 'status' && selected && (
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
              className="bg-white rounded-2xl w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Holat o'zgartirish</h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
              </div>
              <div className="p-6 space-y-3">
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                    {formError}
                  </div>
                )}
                <p className="text-sm text-gray-500 mb-4">Xona {selected.roomNumber} uchun holat tanlang:</p>
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setNewStatus(s)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all',
                      newStatus === s ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs mr-2', ROOM_STATUS_COLORS[s])}>{s}</span>
                  </button>
                ))}
                <div className="flex gap-3 pt-2">
                  <button onClick={closeModal} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Bekor</button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => statusMutation.mutate({ id: selected.id, status: newStatus })}
                    disabled={statusMutation.isPending}
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Saqlash
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
