'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Hotel } from 'lucide-react';
import { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-aura-cream via-white to-aura-emerald/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8"
      >
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <Hotel className="h-8 w-8 text-aura-emerald" />
          <span className="text-2xl font-bold text-aura-emerald-dark tracking-wide">AURA</span>
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">{title}</h1>
        <p className="text-gray-500 text-center mb-6">{subtitle}</p>

        {children}
      </motion.div>
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4 text-sm overflow-hidden"
    >
      {message}
    </motion.div>
  );
}
