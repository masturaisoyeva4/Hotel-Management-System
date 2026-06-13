'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, FileText, Download, AlertCircle } from 'lucide-react';
import { FadeIn, StaggerGroup, StaggerItem } from '../../../components/motion/FadeIn';
import { adminInvoicesService } from '../../../services/admin-invoices.service';
import { formatDate, formatCurrency, cn } from '../../../lib/utils';
import { getErrorMessage } from '../../../lib/error-handler';

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-800',
  paid:     'bg-green-100 text-green-800',
  refunded: 'bg-blue-100 text-blue-800',
  failed:   'bg-red-100 text-red-800',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash:          'Naqd',
  card:          'Karta',
  online:        'Onlayn',
  bank_transfer: 'Bank o\'tkazmasi',
};

export default function AdminInvoicesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['invoices', statusFilter],
    queryFn: () => adminInvoicesService.getAll({ limit: 30, paymentStatus: statusFilter || undefined }),
  });

  const invoices = (data || []).filter((inv) =>
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.booking?.bookingNumber?.toLowerCase().includes(search.toLowerCase())
  );

  // Summary stats
  const totalPaid = (data || [])
    .filter((i) => i.paymentStatus === 'paid')
    .reduce((sum, i) => sum + Number(i.totalAmount), 0);

  const totalPending = (data || []).filter((i) => i.paymentStatus === 'pending').length;

  const summaryCards = [
    { label: "Jami to'langan", value: formatCurrency(totalPaid), color: 'text-green-600' },
    { label: 'Kutayotgan', value: `${totalPending} ta`, color: 'text-yellow-600' },
    { label: 'Jami fakturalar', value: `${data?.length || 0} ta`, color: 'text-gray-900' },
  ];

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <FadeIn>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Hisob-fakturalar</h1>
          <p className="text-gray-500">To'lovlar va hisob-fakturalar</p>
        </div>
      </FadeIn>

      {/* Summary cards */}
      <StaggerGroup className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {summaryCards.map((c) => (
          <StaggerItem key={c.label}>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">{c.label}</p>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>

      {/* Filters */}
      <FadeIn delay={0.05}>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Faktura yoki bron raqami bo'yicha..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="">Barcha to'lovlar</option>
            {['pending', 'paid', 'refunded', 'failed'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
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
                  {['Faktura №', 'Bron №', 'Mehmonxona', 'Sana', 'Summa', 'Soliq', 'Jami', 'Usul', 'Holat', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400">Yuklanmoqda...</td></tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-red-600">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      {getErrorMessage(error, 'Fakturalarni yuklashda xatolik')}
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-16 text-center">
                      <FileText className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-gray-400">Fakturalar topilmadi</p>
                    </td>
                  </tr>
                ) : invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm font-medium text-blue-600 whitespace-nowrap">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {inv.booking?.bookingNumber || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[120px] truncate">
                      {inv.hotel?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(inv.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatCurrency(Number(inv.subtotal))}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatCurrency(Number(inv.taxAmount))}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 whitespace-nowrap">
                      {formatCurrency(Number(inv.totalAmount))}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {PAYMENT_METHOD_LABELS[inv.paymentMethod] || inv.paymentMethod}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap', PAYMENT_STATUS_COLORS[inv.paymentStatus])}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="PDF yuklab olish"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
