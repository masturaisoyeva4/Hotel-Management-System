'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { CreditCard, X, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { invoicesService } from '../../services/invoices.service';
import { formatCurrency } from '../../lib/utils';
import { getErrorMessage } from '../../lib/error-handler';

interface PaymentModalProps {
  bookingId: string;
  orderNumber: string;
  title: string;
  subtitle?: string;
  amount: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PaymentModal({ bookingId, orderNumber, title, subtitle, amount, onClose, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<'summary' | 'card' | 'success'>('summary');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [phone, setPhone] = useState('');

  const payMutation = useMutation({
    mutationFn: () => invoicesService.payForBooking(bookingId),
    onSuccess: () => {
      setStep('success');
      onSuccess?.();
    },
  });

  const formatCardNumber = (value: string) =>
    value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const cardComplete = cardNumber.replace(/\s/g, '').length === 16 && expiry.length === 5;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          onClick={(e) => e.stopPropagation()}
          className={
            step === 'card'
              ? 'bg-[#1c1f26] text-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden'
              : 'bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden'
          }
        >
          {/* Step 1: order summary */}
          {step === 'summary' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">To'lov</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="font-semibold text-gray-900">{title}</p>
                {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
                <p className="font-mono text-xs text-gray-400 mt-2">№ {orderNumber}</p>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <span className="text-gray-600">Jami narxi</span>
                <span className="text-2xl font-bold text-aura-emerald-dark">{formatCurrency(amount)}</span>
              </div>

              <button
                onClick={() => setStep('card')}
                className="w-full mt-4 bg-aura-emerald text-white py-3 rounded-xl font-semibold hover:bg-aura-emerald-light active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="h-5 w-5" />
                Buyurtmani tasdiqlash
              </button>
            </div>
          )}

          {/* Step 2: card payment (Click-style) */}
          {step === 'card' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-aura-gold flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-aura-emerald-dark" />
                  </div>
                  <span className="font-bold text-lg">To'lov</span>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-gray-400 text-sm mb-1">Siz to'layapsiz:</p>
              <p className="font-semibold mb-4">{title}</p>

              <div className="bg-white/5 rounded-xl p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Buyurtma raqami</span>
                  <span className="font-mono">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Summa</span>
                  <span className="text-aura-gold font-bold text-lg">{formatCurrency(amount)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Telefon raqam</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 XX XXX XX XX"
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-aura-gold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">Karta raqami</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="0000 0000 0000 0000"
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-aura-gold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Amal qilish muddati</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-aura-gold font-mono"
                    />
                  </div>
                </div>
              </div>

              {payMutation.isError && (
                <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg mt-4">
                  {getErrorMessage(payMutation.error, "To'lovda xatolik yuz berdi")}
                </p>
              )}

              <button
                onClick={() => payMutation.mutate()}
                disabled={!cardComplete || payMutation.isPending}
                className="w-full mt-5 bg-aura-gold text-aura-emerald-dark py-3 rounded-xl font-semibold hover:bg-aura-gold-light active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {payMutation.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
                Davom etish
              </button>

              <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-4">
                <ShieldCheck className="h-3.5 w-3.5" /> Xavfsiz to'lov
              </p>
            </div>
          )}

          {/* Step 3: success */}
          {step === 'success' && (
            <div className="p-6 text-center">
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">To'lov muvaffaqiyatli</h2>
              <p className="text-sm text-gray-500 mb-1">{title}</p>
              <p className="text-2xl font-bold text-aura-emerald-dark mb-6">{formatCurrency(amount)}</p>
              <button
                onClick={onClose}
                className="w-full bg-aura-emerald text-white py-3 rounded-xl font-semibold hover:bg-aura-emerald-light active:scale-[0.99] transition-all"
              >
                Yopish
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
