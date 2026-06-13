'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CreditCard, Shield, ArrowLeft, CheckCircle, Loader2, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FadeIn } from '../../../components/motion/FadeIn';
import { invoicesService } from '../../../services/invoices.service';
import { paymentsService } from '../../../services/payments.service';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { getErrorMessage } from '../../../lib/error-handler';

export default function PaymentPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const router = useRouter();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [payError, setPayError] = useState('');
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: invoice, isLoading, isError, error } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => invoicesService.getOne(invoiceId),
    enabled: !!invoiceId,
  });

  const payMutation = useMutation({
    mutationFn: () => paymentsService.createIntent(invoiceId),
    onSuccess: () => {
      setPaymentSuccess(true);
      setTimeout(() => router.push('/bookings'), 3000);
    },
    onError: (err: unknown) => setPayError(getErrorMessage(err, "To'lovni amalga oshirishda xatolik")),
  });

  // Format card number with spaces
  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  // Format expiry date
  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (cardForm.cardNumber.replace(/\s/g, '').length < 16) errs.cardNumber = 'Karta raqami to\'liq emas';
    if (cardForm.expiryDate.length < 5) errs.expiryDate = 'Muddatni kiriting';
    if (cardForm.cvv.length < 3) errs.cvv = 'CVV 3 raqam';
    if (!cardForm.cardHolder.trim()) errs.cardHolder = 'Karta egasi kiritilmadi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setPayError('');
    payMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-red-600 px-4 text-center">
        <AlertCircle className="h-14 w-14 mb-4" />
        <p>{getErrorMessage(error, 'Hisob-faktura topilmadi')}</p>
        <Link href="/bookings" className="mt-4 text-blue-600 hover:underline text-sm">
          Bronlarga qaytish
        </Link>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-xl"
        >
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">To'lov amalga oshdi!</h1>
          <p className="text-gray-500 mb-6">
            {formatCurrency(Number(invoice.totalAmount))} muvaffaqiyatli to'landi.
          </p>
          <p className="text-sm text-gray-400">Bronlar sahifasiga yo'naltirilmoqda...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/bookings" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-green-600" />
            <span className="text-lg font-bold text-gray-900">Xavfsiz to'lov</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Card form */}
        <FadeIn>
          <form onSubmit={handlePay} className="space-y-5">
            {/* Card visual */}
            <div className="h-48 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 h-32 w-32 rounded-full border-2 border-white" />
                <div className="absolute top-4 right-12 h-32 w-32 rounded-full border-2 border-white" />
              </div>
              <CreditCard className="h-8 w-8 mb-6 opacity-80" />
              <p className="font-mono text-xl tracking-widest mb-4">
                {cardForm.cardNumber || '•••• •••• •••• ••••'}
              </p>
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-white/60 text-xs mb-0.5">Karta egasi</p>
                  <p className="font-medium">{cardForm.cardHolder || 'FULL NAME'}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-xs mb-0.5">Muddat</p>
                  <p className="font-medium">{cardForm.expiryDate || 'MM/YY'}</p>
                </div>
              </div>
            </div>

            {/* Form fields */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Karta raqami</label>
                <input
                  value={cardForm.cardNumber}
                  onChange={(e) => setCardForm({ ...cardForm, cardNumber: formatCardNumber(e.target.value) })}
                  placeholder="1234 5678 9012 3456"
                  className={`w-full border rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.cardNumber ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Muddat</label>
                  <input
                    value={cardForm.expiryDate}
                    onChange={(e) => setCardForm({ ...cardForm, expiryDate: formatExpiry(e.target.value) })}
                    placeholder="MM/YY"
                    className={`w-full border rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.expiryDate ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    value={cardForm.cvv}
                    onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                    placeholder="123"
                    type="password"
                    className={`w-full border rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.cvv ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Karta egasi</label>
                <input
                  value={cardForm.cardHolder}
                  onChange={(e) => setCardForm({ ...cardForm, cardHolder: e.target.value.toUpperCase() })}
                  placeholder="JOHN DOE"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase transition ${errors.cardHolder ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.cardHolder && <p className="text-red-500 text-xs mt-1">{errors.cardHolder}</p>}
              </div>
            </div>

            {payError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {payError}
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={payMutation.isPending}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {payMutation.isPending
                ? <><Loader2 className="h-5 w-5 animate-spin" /> To'lanmoqda...</>
                : <><Shield className="h-5 w-5" /> {formatCurrency(Number(invoice.totalAmount))} To'lash</>
              }
            </motion.button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Lock className="h-3.5 w-3.5" />
              <span>256-bit SSL shifrlash bilan himoyalangan</span>
            </div>
          </form>
        </FadeIn>

        {/* Right: Order summary */}
        <FadeIn delay={0.05}>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Buyurtma tafsilotlari</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Mehmonxona</span>
                  <span className="font-medium text-gray-900">{invoice.hotel?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Bron raqami</span>
                  <span className="font-mono text-blue-600">{invoice.booking?.bookingNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Kirish</span>
                  <span className="text-gray-900">{invoice.booking?.checkInDate ? formatDate(invoice.booking.checkInDate) : '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Chiqish</span>
                  <span className="text-gray-900">{invoice.booking?.checkOutDate ? formatDate(invoice.booking.checkOutDate) : '—'}</span>
                </div>

                <hr className="border-gray-100" />

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Xona narxi</span>
                  <span>{formatCurrency(Number(invoice.subtotal))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Soliq (12%)</span>
                  <span>{formatCurrency(Number(invoice.taxAmount))}</span>
                </div>
                {Number(invoice.discountAmount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Chegirma</span>
                    <span>-{formatCurrency(Number(invoice.discountAmount))}</span>
                  </div>
                )}

                <hr className="border-gray-100" />

                <div className="flex justify-between font-bold text-lg">
                  <span className="text-gray-900">Jami</span>
                  <span className="text-blue-600">{formatCurrency(Number(invoice.totalAmount))}</span>
                </div>
              </div>
            </div>

            {/* Security badges */}
            <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Xavfsiz to'lov</span>
              </div>
              <ul className="space-y-1.5 text-sm text-green-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> SSL/TLS shifrlash
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Stripe xavfsizlik tizimi
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Karta ma'lumotlari saqlanmaydi
                </li>
              </ul>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
