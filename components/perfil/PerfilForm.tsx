'use client'

import { useState } from 'react'
import { Edit2, Save, X, Loader2 } from 'lucide-react'
import type { Perfil } from '@/types'

interface PerfilFormProps {
  perfil: Perfil
}

export function PerfilForm({ perfil }: PerfilFormProps) {
  const [editando, setEditando] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    nombre_completo: perfil.nombre_completo,
    telefono: perfil.telefono || '',
    numero_unidad: perfil.numero_unidad || '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/perfil/actualizar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar perfil')
      }

      setSuccess(true)
      setEditando(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setCargando(false)
    }
  }

  function handleCancel() {
    setFormData({
      nombre_completo: perfil.nombre_completo,
      telefono: perfil.telefono || '',
      numero_unidad: perfil.numero_unidad || '',
    })
    setEditando(false)
    setError(null)
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-neutral-900 dark:text-white">Editar Información</h3>
        {!editando && (
          <button
            onClick={() => setEditando(true)}
            className="btn-secondary text-sm gap-1.5"
          >
            <Edit2 className="h-4 w-4" />
            Editar
          </button>
        )}
      </div>

      {editando ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre Completo */}
          <div>
            <label htmlFor="nombre_completo" className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
              Nombre Completo
            </label>
            <input
              id="nombre_completo"
              type="text"
              name="nombre_completo"
              value={formData.nombre_completo}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              className="input w-full"
              required
            />
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
              Teléfono
            </label>
            <input
              id="telefono"
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="+56 9 XXXX XXXX"
              className="input w-full"
            />
          </div>

          {/* Número de Unidad */}
          <div>
            <label htmlFor="numero_unidad" className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
              Número de Unidad
            </label>
            <input
              id="numero_unidad"
              type="text"
              name="numero_unidad"
              value={formData.numero_unidad}
              onChange={handleChange}
              placeholder="301, 4B, etc."
              className="input w-full"
            />
          </div>

          {/* Mensajes */}
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-300">
              Perfil actualizado correctamente
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={cargando}
              className="btn-primary text-sm gap-1.5 flex-1"
            >
              {cargando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={cargando}
              className="btn-secondary text-sm gap-1.5"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-neutral-500 mb-1">Nombre completo</p>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {formData.nombre_completo}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">Teléfono</p>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {formData.telefono || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">Unidad</p>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {formData.numero_unidad || '—'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
