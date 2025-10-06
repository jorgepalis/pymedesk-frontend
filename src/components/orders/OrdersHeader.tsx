interface OrdersHeaderProps {
  onNavigateOrders: () => void;
}

export function OrdersHeader({ onNavigateOrders }: OrdersHeaderProps) {
  return (
    <div className="absolute top-6 right-6 flex items-center gap-2">
      <button
        type="button"
        onClick={onNavigateOrders}
        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
      >
        Órdenes
      </button>
    </div>
  );
}
