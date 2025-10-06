'use client';

import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

export function CartFloatingButton() {
  const { totalItems, toggleCart } = useCart();
  const { isAuthenticated } = useAuth();
  const authenticated = isAuthenticated();

  if (!authenticated) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggleCart}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
      aria-label="Abrir carrito"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.086.837l.383 1.436m0 0 1.312 4.92m-.696-5.756h12.056c.75 0 1.266.715 1.057 1.438l-1.383 4.848a1.125 1.125 0 01-1.08.819H7.654m12.103 5.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm-10.5 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
      {totalItems > 0 ? (
        <span className="absolute -top-1.5 -right-1.5 inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
          {totalItems}
        </span>
      ) : null}
    </button>
  );
}
