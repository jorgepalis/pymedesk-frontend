'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productEndpoints } from '@/api/endpoints/products';
import { orderEndpoints } from '@/api/endpoints/orders';
import type { Order, Product } from '@/api/types';
import { ApiError } from '@/api/client';
import { useNotifications } from '@/components/feedback/NotificationsProvider';
import { useAuth } from '@/hooks/useAuth';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { OrderCard } from '@/components/orders/OrderCard';
import { formatCurrency } from '@/utils/currency';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, profile, refreshProfile } = useAuth();
  const { notify } = useNotifications();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [productsLoading, setProductsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [productsError, setProductsError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [productModalLoading, setProductModalLoading] = useState(false);
  const [productModalError, setProductModalError] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '0',
  });

  const isEditMode = productModalMode === 'edit';
  const productModalTitle = useMemo(
    () => (isEditMode ? 'Editar producto' : 'Crear nuevo producto'),
    [isEditMode],
  );
  const productModalSubmitLabel = isEditMode ? 'Guardar cambios' : 'Crear producto';

  const resetCreateForm = () => {
    setProductForm({ name: '', description: '', price: '', stock: '0' });
    setProductModalError(null);
    setProductModalLoading(false);
    setSelectedProductId(null);
  };

  const openCreateModal = () => {
    resetCreateForm();
    setProductModalMode('create');
    setIsProductModalOpen(true);
  };

  const closeCreateModal = () => {
    if (productModalLoading) return;
    setIsProductModalOpen(false);
    setSelectedProductId(null);
  };

  const handleCreateFieldChange = (
    field: 'name' | 'description' | 'price' | 'stock',
  ) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setProductForm((prev) => ({
        ...prev,
        [field]: field === 'stock' ? value.replace(/[^0-9]/g, '') : value,
      }));
    };

  const handleCreateProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (productModalLoading) return;

    const name = productForm.name.trim();
    const description = productForm.description.trim();
    const price = productForm.price.trim();
    const stockValue = productForm.stock.trim();
    const stock = Number.parseInt(stockValue, 10);

    if (!name || !description || !price) {
      setProductModalError('Todos los campos son obligatorios.');
      return;
    }

    if (!Number.isFinite(stock) || stock < 0) {
      setProductModalError('El stock debe ser un número mayor o igual que cero.');
      return;
    }

    setProductModalLoading(true);
    setProductModalError(null);

    try {
      if (isEditMode && selectedProductId) {
        const updatedProduct = await productEndpoints.update(selectedProductId, {
          name,
          description,
          price,
          stock,
        });

        setProducts((prev) =>
          prev.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)),
        );
        notify('Producto actualizado correctamente.', { tone: 'success' });
      } else {
        const newProduct = await productEndpoints.create({
          name,
          description,
          price,
          stock,
        });

        setProducts((prev) => [newProduct, ...prev]);
        notify('Producto creado correctamente.', { tone: 'success' });
      }

      setIsProductModalOpen(false);
      resetCreateForm();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : isEditMode
            ? 'No se pudo actualizar el producto.'
            : 'No se pudo crear el producto.';
      setProductModalError(message);
      notify(message, { tone: 'error' });
    } finally {
      setProductModalLoading(false);
    }
  };

  const openEditModal = async (productId: number) => {
    setProductModalMode('edit');
    setSelectedProductId(productId);
    setProductModalLoading(true);
    setProductModalError(null);
    setIsProductModalOpen(true);

    try {
      const product = await productEndpoints.detail(productId);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: String(product.stock ?? 0),
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'No se pudo obtener el detalle del producto.';
      setProductModalError(message);
      notify(message, { tone: 'error' });
    } finally {
      setProductModalLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const verifyAccess = async () => {
      const hasTokens = isAuthenticated();
      if (!hasTokens) {
        if (!cancelled) {
          notify('Necesitas iniciar sesión para acceder al panel de administración.', {
            tone: 'error',
          });
          router.replace('/login');
          setCheckingAuth(false);
        }
        return;
      }

      try {
        let current = profile;
        if (!current) {
          current = await refreshProfile();
        }

        if (!current || current.role_name !== 'admin') {
          if (!cancelled) {
            notify('No tienes permisos para acceder al panel de administración.', {
              tone: 'error',
            });
            router.replace('/');
            setCheckingAuth(false);
          }
          return;
        }

        if (!cancelled) {
          setAuthorized(true);
          setCheckingAuth(false);
        }
      } catch {
        if (!cancelled) {
          notify('No se pudo validar tu sesión. Inicia sesión nuevamente.', {
            tone: 'error',
          });
          router.replace('/login');
          setCheckingAuth(false);
        }
      }
    };

    verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, profile, refreshProfile, router, notify]);

  useEffect(() => {
    if (!authorized) return;
    let cancelled = false;

    const loadProducts = async () => {
      setProductsLoading(true);
      setProductsError(null);
      try {
        const data = await productEndpoints.list();
        if (!cancelled) {
          setProducts(data);
        }
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
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

    const loadOrders = async () => {
      setOrdersLoading(true);
      setOrdersError(null);
      try {
        const data = await orderEndpoints.list();
        if (!cancelled) {
          setOrders(data);
        }
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'No se pudieron cargar las órdenes.';
        if (!cancelled) {
          setOrdersError(message);
        }
        notify(message, { tone: 'error' });
      } finally {
        if (!cancelled) {
          setOrdersLoading(false);
        }
      }
    };

    loadProducts();
    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [authorized, notify]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Verificando permisos…
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-slate-50 p-8">
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <LogoutButton />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="rounded-2xl bg-white p-10 shadow-xl">
          <h1 className="text-3xl font-semibold text-slate-900">Panel de administración</h1>
          <p className="mt-3 max-w-3xl text-base text-slate-600">
            Consulta el catálogo de productos y supervisa las órdenes registradas en la plataforma.
          </p>
        </header>

        <section className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-slate-900">Productos</h2>
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-full border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              Nuevo producto
            </button>
          </div>

          {productsLoading ? (
            <p className="mt-4 text-sm text-slate-500">Cargando productos…</p>
          ) : null}

          {productsError ? (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {productsError}
            </p>
          ) : null}

          {!productsLoading && !productsError && products.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No hay productos registrados.</p>
          ) : null}

          {!productsLoading && !productsError && products.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Producto</th>
                    <th className="px-4 py-3 text-left">Descripción</th>
                    <th className="px-4 py-3 text-right">Precio</th>
                    <th className="px-4 py-3 text-right">Stock</th>
                    <th className="px-4 py-3 text-center">Editar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {product.description || '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-900">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">
                        {product.stock}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => openEditModal(product.id)}
                          className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                          aria-label={`Editar producto ${product.name}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4"
                          >
                            <path d="M15.586 3.586a2 2 0 0 1 0 2.828l-8.25 8.25a2 2 0 0 1-.878.506l-3.068.767a.5.5 0 0 1-.606-.607l.767-3.068a2 2 0 0 1 .506-.878l8.25-8.25a2 2 0 0 1 2.828 0Zm-3.036 1.208-6.5 6.5a.5.5 0 0 0-.126.22l-.394 1.576 1.576-.394a.5.5 0 0 0 .22-.126l6.5-6.5-1.276-1.276ZM4 15.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5H4Z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-slate-900">Órdenes</h2>
          </div>

          {ordersLoading ? (
            <p className="mt-4 text-sm text-slate-500">Cargando órdenes…</p>
          ) : null}

          {ordersError ? (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {ordersError}
            </p>
          ) : null}

          {!ordersLoading && !ordersError && orders.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No hay órdenes registradas.</p>
          ) : null}

          {!ordersLoading && !ordersError && orders.length > 0 ? (
            <div className="mt-6 space-y-6">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : null}
        </section>
      </div>

      {isProductModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <header className="mb-4">
              <h3 className="text-xl font-semibold text-slate-900">{productModalTitle}</h3>
              <p className="mt-1 text-sm text-slate-500">
                Completa la información para añadir o actualizar un producto en el catálogo.
              </p>
            </header>

            <form className="space-y-4" onSubmit={handleCreateProduct}>
              <div>
                <label className="block text-sm font-medium text-slate-600" htmlFor="create-name">
                  Nombre
                </label>
                <input
                  id="create-name"
                  type="text"
                  value={productForm.name}
                  onChange={handleCreateFieldChange('name')}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="Ej. Computador escritorio"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-slate-600"
                  htmlFor="create-description"
                >
                  Descripción
                </label>
                <textarea
                  id="create-description"
                  value={productForm.description}
                  onChange={handleCreateFieldChange('description')}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  rows={3}
                  placeholder="Ej. Computador de escritorio económico"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-600" htmlFor="create-price">
                    Precio
                  </label>
                  <input
                    id="create-price"
                    type="text"
                    inputMode="decimal"
                    value={productForm.price}
                    onChange={handleCreateFieldChange('price')}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="Ej. 2000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600" htmlFor="create-stock">
                    Stock
                  </label>
                  <input
                    id="create-stock"
                    type="number"
                    min={0}
                    value={productForm.stock}
                    onChange={handleCreateFieldChange('stock')}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    required
                  />
                </div>
              </div>

              {productModalError ? (
                <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{productModalError}</p>
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={productModalLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={productModalLoading}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {productModalLoading ? 'Guardando…' : productModalSubmitLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
