'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos. Verifica tus datos.'
          : 'Error al iniciar sesión. Intenta nuevamente.'
      )
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">CondoIA</span>
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-neutral-900 dark:text-white">
            Bienvenido de vuelta
          </h1>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            Ingresa a tu cuenta para continuar
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300"
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.cl"
                className="input"
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Contraseña
                </label>
                <Link href="/olvide-contrasena" className="text-sm text-primary-600 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-neutral-600 dark:text-neutral-400">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-primary-600 font-medium hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
