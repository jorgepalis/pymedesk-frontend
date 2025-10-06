import type { Product } from '@/api/types';
import { formatCurrency } from '@/utils/currency';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const disabled = product.stock === 0;
  const priceLabel = formatCurrency(product.price);

  const handleAdd = () => {
    if (disabled) return;
    onAddToCart?.(product);
  };

  return (
    <article
      className={`flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md ${
        disabled ? 'border-slate-200 opacity-60 grayscale' : 'border-slate-200'
      }`}
      data-disabled={disabled || undefined}
    >
      <header className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
      </header>
      <p className="flex-1 text-sm text-slate-600">{product.description}</p>
      <div className="mt-6 flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-900">{priceLabel}</span>
          {disabled ? (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
              Sin stock
            </span>
          ) : (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              Disponible
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}
