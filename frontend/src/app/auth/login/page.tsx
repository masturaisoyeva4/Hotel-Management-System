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

const loginSchema = z.object({
  email: z.string().email("To'g'ri email kiriting"),
  password: z.string().min(1, 'Parol majburiy'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      await login(data.email, data.password);
      const user = useAuthStore.getState().user;
      if (user?.role === 'guest') {
        router.push('/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Kirish muvaffaqiyatsiz'));
    }
  };

  return (
    <AuthCard title="Tizimga kirish" subtitle="Hisobingizga kiring">
      <AnimatePresence>{error && <AuthError message={error} />}</AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="email@example.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-aura-emerald transition"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parol</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-aura-emerald text-white py-3 rounded-lg font-semibold hover:bg-aura-emerald-light active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
          Kirish
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6">
        Hisobingiz yo'qmi?{' '}
        <Link href="/auth/register" className="text-aura-emerald font-medium hover:underline">
          Ro'yxatdan o'ting
        </Link>
      </p>

      <Link
        href="/admin/dashboard"
        className="mt-4 flex items-center justify-center gap-2 border border-aura-gold/50 text-aura-gold-dark text-sm font-semibold py-2.5 rounded-lg hover:bg-aura-gold/10 transition-colors"
      >
        Admin panel
      </Link>
    </AuthCard>
  );
}
