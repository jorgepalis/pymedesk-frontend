'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { orderEndpoints } from '@/api/endpoints/orders';
import type { Order } from '@/api/types';
import { ApiError } from '@/api/client';
import { useNotifications } from '@/components/feedback/NotificationsProvider';
import { useAuth } from '@/hooks/useAuth';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { OrderCard } from '@/components/orders/OrderCard';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, profile, refreshProfile } = useAuth();
  const { notify } = useNotifications();
  const [authChecked, setAuthChecked] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = profile?.role_name === 'admin';

  const goHome = useCallback(() => {
    router.push('/');
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const isAuth = isAuthenticated();
    setAuthChecked(true);
    if (!isAuth) {
      router.replace('/login');
      return () => {
        cancelled = true;
      };
    }

    if (!profile) {
      refreshProfile().catch(() => {
        if (!cancelled) {
          notify('No se pudo actualizar la sesión. Inicia sesión nuevamente.', {
            tone: 'error',
          });
          router.replace('/login');
        }
      });
    }

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, profile, refreshProfile, notify, router]);

  useEffect(() => {
    if (!authChecked) return;

    let cancelled = false;

    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await orderEndpoints.list();
        if (!cancelled) {
          setOrders(data);
        }
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudieron obtener las órdenes.';
        if (!cancelled) {
          setError(message);
        }
        notify(message, { tone: 'error' });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [authChecked, notify]);

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Comprobando sesión…
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 p-8">
      <div className="absolute top-6 right-6 flex items-center gap-2">
        {!isAdmin ? (
          <button
            type="button"
            onClick={goHome}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            Ir al inicio
          </button>
        ) : null}
        <LogoutButton />
      </div>
      <div className="w-full max-w-5xl space-y-8 rounded-2xl bg-white p-10 shadow-xl">
        <header className="text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Órdenes</h1>
          <p className="mt-3 text-base text-slate-600">
            Revisa el historial de órdenes y sus detalles.
          </p>
        </header>

        {loading ? (
          <p className="text-sm text-slate-500">Cargando órdenes…</p>
        ) : null}

        {error ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        ) : null}

        {!loading && !error && orders.length === 0 ? (
          <p className="text-sm text-slate-500">No hay órdenes registradas.</p>
        ) : null}

        <div className="grid gap-6">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}
