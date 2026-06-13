'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { AuthCard, AuthError } from '../../../components/layout/AuthCard';
import { getErrorMessage } from '../../../lib/error-handler';

const registerSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("To'g'ri email kiriting").optional().or(z.literal('')),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, 'Parol kamida 8 ta belgi')
    .regex(/[A-Z]/, 'Parolda kamida bitta katta harf bo\'lsin')
    .regex(/[0-9]/, 'Parolda kamida bitta raqam bo\'lsin'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Parollar mos kelmaydi',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    try {
      const { confirmPassword, ...submitData } = data;
      await registerUser(submitData);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Ro'yxatdan o'tish muvaffaqiyatsiz"));
    }
  };

  return (
    <AuthCard title="Ro'yxatdan o'tish" subtitle="Yangi hisob yarating">
      <AnimatePresence>{error && <AuthError message={error} />}</AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ism (ixtiyoriy)</label>
            <input
              {...register('firstName')}
              type="text"
              placeholder="Ali"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-aura-emerald transition"
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Familiya (ixtiyoriy)</label>
            <input
              {...register('lastName')}
              type="text"
              placeholder="Valiyev"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-aura-emerald transition"
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email (ixtiyoriy)</label>
          <input
            {...register('email')}
            type="email"
            placeholder="email@example.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-aura-emerald transition"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefon (ixtiyoriy)</label>
          <input
            {...register('phone')}
            type="tel"
            placeholder="+998901234567"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-aura-emerald transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parol</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Kamida 8 ta belgi, 1 katta harf, 1 raqam"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-aura-emerald transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parolni tasdiqlang</label>
          <input
            {...register('confirmPassword')}
            type="password"
            placeholder="Parolni qayta kiriting"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-aura-emerald transition"
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-aura-emerald text-white py-3 rounded-lg font-semibold hover:bg-aura-emerald-light active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
          Ro'yxatdan o'tish
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6">
        Hisobingiz bormi?{' '}
        <Link href="/auth/login" className="text-aura-emerald font-medium hover:underline">
          Kirish
        </Link>
      </p>
    </AuthCard>
  );
}
