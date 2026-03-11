'use client'

import { useState, useMemo } from 'react'
import { Search, Star, Phone, Mail, CheckCircle2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Proveedor } from '@/types'

const CATEGORIA_LABELS = {
  plomeria: 'Plomería',
  electricidad: 'Electricidad',
  limpieza: 'Limpieza',
  jardineria: 'Jardinería',
  seguridad: 'Seguridad',
  ascensores: 'Ascensores',
  pintura: 'Pintura',
  otro: 'Otro',
}

const CATEGORIA_COLORS = {
  plomeria: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  electricidad: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  limpieza: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  jardineria: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  seguridad: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  ascensores: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  pintura: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  otro: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300',
}

interface ProveedoresClientProps {
  proveedores: Proveedor[]
}

function StarRating({ calificacion }: { calificacion: number | null }) {
  if (!calificacion) return null
  const rating = Math.round(calificacion * 10) / 10
  const stars = Math.round(rating)

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300 dark:text-neutral-600'
          )}
        />
      ))}
      <span className="text-xs text-neutral-600 dark:text-neutral-400 ml-1">({rating})</span>
    </div>
  )
}

export function ProveedoresClient({ proveedores }: ProveedoresClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null)

  // Filter proveedores based on search and filters
  const proveedoresFiltrados = useMemo(() => {
    return proveedores.filter((p) => {
      const matchesSearch =
        (p.nombre?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        (p.rut?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        (p.telefono?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        (p.email?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())

      const matchesCategoria = filtroCategoria ? p.categoria === filtroCategoria : true

      return matchesSearch && matchesCategoria
    })
  }, [proveedores, searchTerm, filtroCategoria])

  // Get unique categories for filter
  const categorias = Array.from(
    new Set(proveedores.map((p) => p.categoria).filter(Boolean))
  ) as string[]

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, RUT, teléfono o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Category Filter */}
      {categorias.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroCategoria(null)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              filtroCategoria === null
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
            )}
          >
            Todas las categorías
          </button>
          {categorias.map((categoria) => (
            <button
              key={categoria}
              onClick={() => setFiltroCategoria(filtroCategoria === categoria ? null : categoria)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                filtroCategoria === categoria
                  ? 'bg-primary-600 text-white'
                  : `${CATEGORIA_COLORS[categoria as keyof typeof CATEGORIA_COLORS] || CATEGORIA_COLORS.otro} hover:opacity-80`
              )}
            >
              {CATEGORIA_LABELS[categoria as keyof typeof CATEGORIA_LABELS] || categoria}
            </button>
          ))}
        </div>
      )}

      {/* Grid de proveedores */}
      {proveedoresFiltrados.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="font-medium text-neutral-900 dark:text-white">
            {proveedores.length === 0 ? 'Sin proveedores registrados' : 'Sin resultados'}
          </h3>
          <p className="text-neutral-500 text-sm mt-1">
            {proveedores.length === 0
              ? 'Agrega proveedores verificados al condominio'
              : 'Intenta con otros filtros o términos de búsqueda'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proveedoresFiltrados.map((proveedor) => {
            const categoriaLabel =
              CATEGORIA_LABELS[proveedor.categoria as keyof typeof CATEGORIA_LABELS] || proveedor.categoria
            const categoriaColor =
              CATEGORIA_COLORS[proveedor.categoria as keyof typeof CATEGORIA_COLORS] || CATEGORIA_COLORS.otro

            return (
              <div
                key={proveedor.id}
                className="card hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-elevated transition-all group flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                      {proveedor.nombre}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">RUT: {proveedor.rut}</p>
                  </div>
                  {proveedor.verificado && (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 ml-2" />
                  )}
                </div>

                {/* Categoría badge */}
                <div className="mb-3">
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      categoriaColor
                    )}
                  >
                    {categoriaLabel}
                  </span>
                </div>

                {/* Rating */}
                <div className="mb-4">
                  <StarRating calificacion={proveedor.calificacion_promedio ?? null} />
                </div>

                {/* Contact Info */}
                <div className="space-y-2 flex-1 mb-4">
                  {proveedor.telefono && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <a
                        href={`tel:${proveedor.telefono}`}
                        className="hover:text-primary-600 transition-colors truncate"
                      >
                        {proveedor.telefono}
                      </a>
                    </div>
                  )}
                  {proveedor.email && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <a
                        href={`mailto:${proveedor.email}`}
                        className="hover:text-primary-600 transition-colors truncate"
                      >
                        {proveedor.email}
                      </a>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {proveedor.notas && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                    {proveedor.notas}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Results counter */}
      {proveedoresFiltrados.length > 0 && (
        <p className="text-xs text-neutral-500 text-center pt-4">
          {proveedoresFiltrados.length} de {proveedores.length} proveedores
        </p>
      )}
    </div>
  )
}
