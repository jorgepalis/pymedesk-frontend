import type { Order } from '@/api/types';
import { formatCurrency } from '@/utils/currency';

interface OrderCardProps {
  order: Order;
}

const statusLabels: Record<Order['status'], string> = {
  PENDING: 'Pendiente',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

const statusClasses: Record<Order['status'], string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export function OrderCard({ order }: OrderCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Orden #{order.id}</h3>
          <p className="text-sm text-slate-500">Creada el {formatDate(order.created_at)}</p>
        </div>
        <span
          className={`rounded-full px-4 py-1 text-xs font-semibold ${statusClasses[order.status]}`}
        >
          {statusLabels[order.status]}
        </span>
      </header>

      <dl className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
        <div>
          <dt className="font-medium text-slate-500">Usuario</dt>
          <dd className="font-semibold text-slate-900">{order.user.email}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Total</dt>
          <dd className="font-semibold text-slate-900">{formatCurrency(order.total_price)}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Items</dt>
          <dd>{order.items.length}</dd>
        </div>
      </dl>

      <section className="mt-6 space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Detalle de productos
        </h4>
        <ul className="space-y-3">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-semibold text-slate-900">{item.product.name}</p>
                <p className="text-xs text-slate-500">
                  Cantidad: {item.quantity} · Precio unitario:{' '}
                  {formatCurrency(item.product.price)}
                </p>
              </div>
              <div className="text-right font-semibold text-slate-900">
                {formatCurrency(item.subtotal)}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
