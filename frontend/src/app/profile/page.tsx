'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, User, Phone, Mail, Lock, Save, Loader2, Eye, EyeOff, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { FadeIn } from '../../components/motion/FadeIn';
import { usersService } from '../../services/users.service';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../lib/error-handler';

const profileSchema = z.object({
  firstName: z.string().min(2, 'Kamida 2 ta harf'),
  lastName:  z.string().min(2, 'Kamida 2 ta harf'),
  phone:     z.string().regex(/^\+?[0-9\s\-()]{7,20}$/, 'Noto\'g\'ri telefon').optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Joriy parol kiritilmadi'),
  newPassword:     z.string().min(8, 'Kamida 8 ta belgi')
                             .regex(/[A-Z]/, 'Katta harf kerak')
                             .regex(/[0-9]/, 'Raqam kerak'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Parollar mos kelmaydi',
  path: ['confirmPassword'],
});

type ProfileForm   = z.infer<typeof profileSchema>;
type PasswordForm  = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [profileMsg,  setProfileMsg]  = useState('');
  const [pwMsg,       setPwMsg]       = useState('');

  // ── Profile form ─────────────────────────────────────────
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName:  user?.lastName  || '',
      phone:     user?.phone     || '',
    },
  });

  const updateProfile = useMutation({
    mutationFn: (data: ProfileForm) => usersService.updateProfile(data),
    onSuccess: (data) => {
      setUser(data);
      setProfileMsg('Profil yangilandi ✓');
      setTimeout(() => setProfileMsg(''), 3000);
    },
    onError: (err) => setProfileMsg(getErrorMessage(err, 'Profilni yangilashda xatolik')),
  });

  // ── Password form ─────────────────────────────────────────
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const changePassword = useMutation({
    mutationFn: (data: PasswordForm) =>
      usersService.changePassword({
        currentPassword: data.currentPassword,
        newPassword:     data.newPassword,
      }),
    onSuccess: () => {
      passwordForm.reset();
      setPwMsg('Parol o\'zgartirildi ✓');
      setTimeout(() => setPwMsg(''), 3000);
    },
    onError: (err) => setPwMsg(getErrorMessage(err, 'Joriy parol noto\'g\'ri')),
  });

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Profil</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Chiqish
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Avatar card */}
        <FadeIn>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl mx-auto mb-3">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <p className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
            <span className="inline-block mt-2 bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full capitalize">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </FadeIn>

        {/* Profile form */}
        <FadeIn delay={0.05}>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Shaxsiy ma'lumotlar
            </h2>
            <form onSubmit={profileForm.handleSubmit((d) => updateProfile.mutate(d))} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ism</label>
                  <input
                    {...profileForm.register('firstName')}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  {profileForm.formState.errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Familiya</label>
                  <input
                    {...profileForm.register('lastName')}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  {profileForm.formState.errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Mail className="h-4 w-4" /> Email
                </label>
                <input
                  value={user?.email}
                  disabled
                  className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Phone className="h-4 w-4" /> Telefon
                </label>
                <input
                  {...profileForm.register('phone')}
                  placeholder="+998901234567"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              {profileMsg && (
                <p className={`text-sm px-4 py-2 rounded-xl ${profileMsg.includes('✓') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                  {profileMsg}
                </p>
              )}
              <motion.button
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={updateProfile.isPending}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Saqlash
              </motion.button>
            </form>
          </div>
        </FadeIn>

        {/* Password form */}
        <FadeIn delay={0.1}>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-600" />
              Parolni o'zgartirish
            </h2>
            <form onSubmit={passwordForm.handleSubmit((d) => changePassword.mutate(d))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Joriy parol</label>
                <div className="relative">
                  <input
                    {...passwordForm.register('currentPassword')}
                    type={showCurrent ? 'text' : 'password'}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yangi parol</label>
                <div className="relative">
                  <input
                    {...passwordForm.register('newPassword')}
                    type={showNew ? 'text' : 'password'}
                    placeholder="Kamida 8 ta belgi, katta harf va raqam"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yangi parolni tasdiqlang</label>
                <input
                  {...passwordForm.register('confirmPassword')}
                  type="password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              {pwMsg && (
                <p className={`text-sm px-4 py-2 rounded-xl ${pwMsg.includes('✓') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                  {pwMsg}
                </p>
              )}
              <motion.button
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={changePassword.isPending}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {changePassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Parolni o'zgartirish
              </motion.button>
            </form>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
