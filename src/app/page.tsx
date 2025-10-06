'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { productEndpoints } from '@/api/endpoints/products';
import type { Product } from '@/api/types';
import { ApiError } from '@/api/client';
import { useNotifications } from '@/components/feedback/NotificationsProvider';
import { ProductCard } from '@/components/products/ProductCard';
import { useCart } from '@/hooks/useCart';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, profile } = useAuth();
  const { notify } = useNotifications();
  const { addItem } = useCart();
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  const isAdmin = profile?.role_name === 'admin';

  const goToDestination = useCallback(() => {
    router.push(isAdmin ? '/admin' : '/orders');
  }, [isAdmin, router]);

  const handleAddToCart = useCallback(
    (product: Product) => {
      const added = addItem(product);
      if (added) {
        notify('Producto agregado al carrito.', { tone: 'success' });
      }
    },
    [addItem, notify],
  );

  useEffect(() => {
    const result = isAuthenticated();
    setAuthenticated(result);
    setAuthChecked(true);

    if (!result) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!authenticated) {
      setProducts([]);
      setProductsLoading(false);
      return;
    }

    let cancelled = false;

    const loadProducts = async () => {
      setProductsLoading(true);
      setProductsError(null);

      try {
        const data = await productEndpoints.list();
        if (!cancelled) {
          setProducts(data);
        }
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudieron cargar los productos.';
        if (!cancelled) {
          setProductsError(message);
        }
        notify(message, { tone: 'error' });
      } finally {
        if (!cancelled) {
          setProductsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [authenticated, notify]);

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Comprobando sesión…
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 p-8">
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <button
          type="button"
          onClick={goToDestination}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          {isAdmin ? 'Panel admin' : 'Órdenes'}
        </button>
        <LogoutButton />
      </div>
      <div className="w-full max-w-5xl space-y-10 rounded-2xl bg-white p-10 shadow-xl">
        <header className="text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Bienvenido a Pymedesk</h1>
        </header>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Productos</h2>
              <p className="text-sm text-slate-500">Explora el catálogo disponible actualmente.</p>
            </div>
            {productsLoading ? (
              <span className="text-sm text-slate-500">Cargando productos…</span>
            ) : null}
          </div>

          {productsError ? (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {productsError}
            </p>
          ) : null}

          {!productsLoading && !productsError && products.length === 0 ? (
            <p className="text-sm text-slate-500">
              No hay productos disponibles en este momento.
            </p>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
