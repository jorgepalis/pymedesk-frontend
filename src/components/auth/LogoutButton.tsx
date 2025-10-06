'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

type LogoutButtonProps = {
  className?: string;
};

const baseClasses =
  'inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-70';

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    if (loading) return;
    setLoading(true);
    clearCart();
    logout();
    router.replace('/login');
  };

  const combinedClassName = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <button type="button" className={combinedClassName} onClick={handleLogout} disabled={loading}>
      {loading ? 'Saliendo…' : 'Cerrar sesión'}
    </button>
  );
}
