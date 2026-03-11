'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const supabase = createClient()

  const [nombreCompleto, setNombreCompleto] = useState('')
  const [rut, setRut] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Verifica e intenta nuevamente.')
      setLoading(false)
      return
    }

    // Validate password length
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      setLoading(false)
      return
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre_completo: nombreCompleto,
            rut,
            telefono,
          },
        },
      })

      if (signUpError) {
        setError(
          signUpError.message === 'User already registered'
            ? 'Este correo ya está registrado. Intenta con otro o inicia sesión.'
            : 'Error al crear la cuenta. Intenta nuevamente.'
        )
        setLoading(false)
        return
      }

      setSuccess(true)
      setNombreCompleto('')
      setRut('')
      setEmail('')
      setTelefono('')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError('Ocurrió un error inesperado. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-neutral-900 dark:text-white">CondoIA</span>
            </Link>
          </div>

          {/* Success Card */}
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2">
              ¡Cuenta creada exitosamente!
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Revisa tu correo electrónico para confirmar tu cuenta. Luego podrás iniciar sesión.
            </p>

            <Link href="/login" className="btn-primary w-full">
              Ir a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    )
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
            Crear cuenta
          </h1>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            Únete a CondoIA para gestionar tu condominio
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300"
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="nombre-completo" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Nombre completo
              </label>
              <input
                id="nombre-completo"
                type="text"
                required
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                placeholder="Juan Pérez García"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="rut" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                RUT
              </label>
              <input
                id="rut"
                type="text"
                required
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                placeholder="12.345.678-9"
                className="input"
              />
            </div>

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
              />
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Teléfono <span className="text-neutral-400">(opcional)</span>
              </label>
              <input
                id="telefono"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+56 9 1234 5678"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={8}
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
              <p className="text-xs text-neutral-500 mt-1">Mínimo 8 caracteres</p>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={8}
                  className="input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                  Creando cuenta...
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-neutral-600 dark:text-neutral-400">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary-600 font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
