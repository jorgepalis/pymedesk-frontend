'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { orderEndpoints } from '@/api/endpoints/orders';
import { ApiError } from '@/api/client';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/components/feedback/NotificationsProvider';
import { formatCurrency, parsePrice } from '@/utils/currency';

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    increment,
    decrement,
    removeItem,
    totalPrice,
    clearCart,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const authenticated = isAuthenticated();
  const { notify } = useNotifications();
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const payload = useMemo(
    () => ({
      items: items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    }),
    [items],
  );

  const resolveErrorMessage = useCallback((error: unknown) => {
    if (error instanceof ApiError && error.message) {
      return error.message;
    }
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return 'No fue posible crear el pedido. Inténtalo nuevamente.';
  }, []);

  const handleCreateOrder = useCallback(async () => {
    if (!items.length || creating) return;

    setCreating(true);
    try {
      await orderEndpoints.create(payload);
      notify('Pedido creado correctamente.', { tone: 'success' });
      clearCart();
      router.push('/orders');
    } catch (error) {
      notify(resolveErrorMessage(error), { tone: 'error' });
    } finally {
      setCreating(false);
    }
  }, [
    items.length,
    creating,
    payload,
    notify,
    clearCart,
    resolveErrorMessage,
    router,
  ]);

  if (!authenticated || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Cerrar carrito"
        className="absolute inset-0 bg-slate-900/40"
        onClick={closeCart}
      />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Tu carrito</h2>
            <p className="text-sm text-slate-500">Resumen de productos seleccionados</p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            Cerrar
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aún no has agregado productos al carrito.
            </p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const unitPrice = parsePrice(item.product.price);
                const subtotal = unitPrice * item.quantity;
                const maxReached = item.quantity >= item.product.stock;

                return (
                  <li
                    key={item.product.id}
                    className="rounded-xl border border-slate-200 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Precio unitario: {formatCurrency(unitPrice)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.product.id)}
                        className="text-xs font-medium text-red-500 transition hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => decrement(item.product.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                        >
                          −
                        </button>
                        <span className="min-w-[2ch] text-center text-sm font-semibold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => increment(item.product.id)}
                          disabled={maxReached}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {formatCurrency(subtotal)}
                      </div>
                    </div>

                    {maxReached ? (
                      <p className="mt-2 text-xs text-amber-600">
                        Has alcanzado el stock disponible para este producto.
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="border-t border-slate-200 p-6">
          <div className="flex items-center justify-between text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
          <button
            type="button"
            onClick={handleCreateOrder}
            disabled={!items.length || creating}
            className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? 'Creando pedido…' : 'Crear pedido'}
          </button>
        </footer>
      </aside>
    </div>
  );
}
