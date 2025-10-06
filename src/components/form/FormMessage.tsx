import type { ReactNode } from 'react';

export type FormMessageTone = 'info' | 'error' | 'success';

const toneClasses: Record<FormMessageTone, string> = {
  info: 'text-slate-600',
  error: 'text-red-600',
  success: 'text-green-600',
};

interface FormMessageProps {
  tone?: FormMessageTone;
  children: ReactNode;
  id?: string;
}

export function FormMessage({ tone = 'info', children, id }: FormMessageProps) {
  const className = `text-sm ${toneClasses[tone]}`;
  const role = tone === 'error' ? 'alert' : undefined;
  return (
    <p id={id} role={role} className={className}>
      {children}
    </p>
  );
}
