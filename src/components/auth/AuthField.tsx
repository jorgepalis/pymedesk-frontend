import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string | null;
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ id, label, error, className, type = 'text', ...props }, ref) => {
    const baseClassName = `mt-1 w-full rounded-lg border px-3 py-2 text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 ${
      error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
        : 'border-slate-300 focus:border-slate-500 focus:ring-slate-200'
    }`;

    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        <input
          id={id}
          ref={ref}
          type={type}
          className={className ? `${baseClassName} ${className}` : baseClassName}
          {...props}
        />
        {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
      </div>
    );
  }
);

AuthField.displayName = 'AuthField';
