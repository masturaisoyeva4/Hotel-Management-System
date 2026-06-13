'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, X, Briefcase, AlertCircle } from 'lucide-react';
import { FadeIn, StaggerGroup, StaggerItem } from '../../../components/motion/FadeIn';
import { employeesService, EmployeePayload } from '../../../services/employees.service';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { getErrorMessage } from '../../../lib/error-handler';

const emptyForm: EmployeePayload = {
  userId: '',
  hotelId: '',
  department: '',
  position: '',
  salary: 0,
  hireDate: '',
};

export default function AdminEmployeesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [form, setForm] = useState<EmployeePayload>(emptyForm);
  const [formError, setFormError] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesService.getAll({ limit: 50 }),
  });

  const employees = (data || []).filter((e) =>
    `${e.user?.firstName} ${e.user?.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase()) ||
    e.position.toLowerCase().includes(search.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: (body: EmployeePayload) => employeesService.create(body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); closeModal(); },
    onError: (err) => setFormError(getErrorMessage(err, 'Xodimni qo\'shishda xatolik')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<EmployeePayload> }) =>
      employeesService.update(id, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); closeModal(); },
    onError: (err) => setFormError(getErrorMessage(err, 'Saqlashda xatolik')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });

  const openCreate = () => { setForm(emptyForm); setFormError(''); setModal('create'); };
  const openEdit = (emp: any) => {
    setSelected(emp);
    setForm({
      userId: emp.userId,
      hotelId: emp.hotelId,
      department: emp.department,
      position: emp.position,
      salary: emp.salary,
      hireDate: emp.hireDate.split('T')[0],
    });
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
            <h1 className="text-2xl font-bold text-gray-900">Xodimlar</h1>
            <p className="text-gray-500">Xodimlarni boshqaring</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={openCreate}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Xodim qo'shish
          </motion.button>
        </div>
      </FadeIn>

      {/* Search */}
      <FadeIn delay={0.05}>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ism, bo'lim yoki lavozim bo'yicha..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
            />
          </div>
        </div>
      </FadeIn>

      {/* Cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-40 animate-pulse" />)}
        </div>
      ) : isError ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 text-red-600">
          <AlertCircle className="h-12 w-12 mx-auto mb-3" />
          <p>{getErrorMessage(error, 'Xodimlarni yuklashda xatolik')}</p>
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
          <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">Xodimlar topilmadi</p>
        </div>
      ) : (
        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <StaggerItem key={emp.id}>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm shrink-0">
                      {emp.user?.firstName?.[0]}{emp.user?.lastName?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{emp.user?.firstName} {emp.user?.lastName}</p>
                      <p className="text-xs text-gray-500 truncate">{emp.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(emp)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { if (confirm('Xodimni o\'chirishni tasdiqlaysizmi?')) deleteMutation.mutate(emp.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bo'lim</span>
                    <span className="font-medium text-gray-900">{emp.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lavozim</span>
                    <span className="font-medium text-gray-900">{emp.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Maosh</span>
                    <span className="font-semibold text-green-600">{formatCurrency(emp.salary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ishga kirgan</span>
                    <span className="text-gray-700">{formatDate(emp.hireDate)}</span>
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
                  {modal === 'create' ? 'Xodim qo\'shish' : 'Xodimni tahrirlash'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                    {formError}
                  </div>
                )}
                {[
                  { label: 'User ID', key: 'userId', placeholder: 'User UUID' },
                  { label: 'Hotel ID', key: 'hotelId', placeholder: 'Hotel UUID' },
                  { label: 'Bo\'lim', key: 'department', placeholder: 'Front Desk' },
                  { label: 'Lavozim', key: 'position', placeholder: 'Receptionist' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      value={(form as Record<string, unknown>)[key] as string}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maosh ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ishga kirgan sana</label>
                  <input
                    type="date"
                    value={form.hireDate}
                    onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Bekor</button>
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
    </div>
  );
}
