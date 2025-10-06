'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthField } from '@/components/auth/AuthField';
import { FormMessage } from '@/components/form/FormMessage';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setFormError('Ingresa correo y contraseña.');
      return;
    }

    try {
      setFormError(null);
  const profile = await login({ email, password });
  router.replace(profile.role_name === 'admin' ? '/admin' : '/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo iniciar sesión.';
      setFormError(message);
    }
  };

  return (
    <AuthLayout title="Inicia sesión" subtitle="Accede con tu correo y contraseña.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          id="email"
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu-correo@ejemplo.com"
          autoComplete="email"
          required
        />

        <AuthField
          id="password"
          label="Contraseña"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        {(formError || error) && (
          <FormMessage tone="error">{formError ?? error}</FormMessage>
        )}

        <div className="space-y-3">
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={loading}
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>

          <p className="text-center text-sm text-slate-600">
            ¿No tienes cuenta?
            <Link href="/register" className="ml-1 font-medium text-slate-900 underline-offset-4 hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
