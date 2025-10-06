'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthField } from '@/components/auth/AuthField';
import { FormMessage } from '@/components/form/FormMessage';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setFormError('Correo y contraseña son obligatorios.');
      return;
    }

    try {
      setFormError(null);
  const profile = await register({ email, name, password });
  router.replace(profile.role_name === 'admin' ? '/admin' : '/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo registrar.';
      setFormError(message);
    }
  };

  return (
    <AuthLayout title="Crear cuenta" subtitle="Regístrate para gestionar tus pedidos.">
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
          id="name"
          label="Nombre"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Tu Nombre"
        />

        <AuthField
          id="password"
          label="Contraseña"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Al menos 8 caracteres"
          autoComplete="new-password"
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
            {loading ? 'Creando cuenta…' : 'Registrarme'}
          </button>

          <p className="text-center text-sm text-slate-600">
            ¿Ya tienes cuenta?
            <Link href="/login" className="ml-1 font-medium text-slate-900 underline-offset-4 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
