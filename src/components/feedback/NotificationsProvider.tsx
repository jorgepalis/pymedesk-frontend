'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type NotificationTone = 'info' | 'success' | 'error';

export interface NotificationDescriptor {
  id: string;
  tone: NotificationTone;
  message: string;
}

interface NotifyOptions {
  tone?: NotificationTone;
  /** Tiempo de vida en milisegundos. Usa 0 para persistente. */
  duration?: number;
}

interface NotificationsContextValue {
  notify: (message: string, options?: NotifyOptions) => string;
  dismiss: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(
  undefined,
);

const toneClasses: Record<NotificationTone, string> = {
  info: 'border-slate-200 bg-white text-slate-900 shadow-lg',
  success: 'border-green-200 bg-green-50 text-green-900 shadow-lg',
  error: 'border-red-200 bg-red-50 text-red-900 shadow-lg',
};

function NotificationItem({ descriptor, onDismiss }: {
  descriptor: NotificationDescriptor;
  onDismiss: (id: string) => void;
}) {
  const { id, tone, message } = descriptor;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm transition ${toneClasses[tone]}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <div className="flex-1 leading-relaxed">{message}</div>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<NotificationDescriptor[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (message: string, { tone = 'error', duration = 5000 }: NotifyOptions = {}) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const descriptor: NotificationDescriptor = { id, tone, message };
      setItems((prev) => [...prev, descriptor]);

      if (duration > 0) {
        const timeoutRef = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timeoutRef);
      }

      return id;
    },
    [dismiss],
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({ notify, dismiss }),
    [notify, dismiss],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-end px-6">
        <div className="flex w-full max-w-sm flex-col gap-3">
          {items.map((descriptor) => (
            <NotificationItem
              key={descriptor.id}
              descriptor={descriptor}
              onDismiss={dismiss}
            />
          ))}
        </div>
      </div>
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationsProvider');
  }
  return context;
};
