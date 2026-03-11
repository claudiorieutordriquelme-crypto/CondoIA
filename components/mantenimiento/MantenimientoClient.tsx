'use client'

import { useState, useMemo } from 'react'
import { Wrench, Search, Filter } from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'
import type { SolicitudMantenimiento } from '@/types'

const ESTADO_CONFIG = {
  abierta: { label: 'Abierta', icon: '🔴', class: 'badge-pendiente' },
  en_progreso: { label: 'En progreso', icon: '🟠', class: 'badge-cobranza' },
  resuelta: { label: 'Resuelta', icon: '🟢', class: 'badge-pagado' },
  cerrada: { label: 'Cerrada', icon: '✓', class: 'badge-pagado' },
}

const PRIORIDAD_CONFIG = {
  baja: { label: 'Baja', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', dot: 'bg-green-500' },
  media: { label: 'Media', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', dot: 'bg-yellow-500' },
  alta: { label: 'Alta', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', dot: 'bg-orange-500' },
  urgente: { label: 'Urgente', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', dot: 'bg-red-500' },
}

const CATEGORIA_LABELS = {
  plomeria: 'Plomería',
  electricidad: 'Electricidad',
  areas_comunes: 'Áreas comunes',
  ascensor: 'Ascensor',
  limpieza: 'Limpieza',
  otro: 'Otro',
}

interface MantenimientoClientProps {
  solicitudes: SolicitudMantenimiento[]
}

export function MantenimientoClient({ solicitudes }: MantenimientoClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null)
  const [filtroPrioridad, setFiltroPrioridad] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Filter solicitudes based on search and filters
  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter((s) => {
      const matchesSearch =
        (s.titulo?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        (s.descripcion?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        (s.unidad_id?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())

      const matchesEstado = filtroEstado ? s.estado === filtroEstado : true
      const matchesPrioridad = filtroPrioridad ? s.prioridad === filtroPrioridad : true

      return matchesSearch && matchesEstado && matchesPrioridad
    })
  }, [solicitudes, searchTerm, filtroEstado, filtroPrioridad])

  const estados = ['abierta', 'en_progreso', 'resuelta', 'cerrada'] as const
  const prioridades = ['baja', 'media', 'alta', 'urgente'] as const

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por título, descripción o unidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'btn-secondary px-3 min-w-[44px]',
              showFilters && 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700'
            )}
            aria-label="Toggle filters"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {/* Filter chips */}
        {showFilters && (
          <div className="card space-y-4">
            {/* Estado filter */}
            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">
                Estado
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFiltroEstado(null)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    filtroEstado === null
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                  )}
                >
                  Todos
                </button>
                {estados.map((estado) => (
                  <button
                    key={estado}
                    onClick={() => setFiltroEstado(filtroEstado === estado ? null : estado)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                      filtroEstado === estado
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                    )}
                  >
                    {ESTADO_CONFIG[estado].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prioridad filter */}
            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-2">
                Prioridad
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFiltroPrioridad(null)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    filtroPrioridad === null
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                  )}
                >
                  Todos
                </button>
                {prioridades.map((prioridad) => (
                  <button
                    key={prioridad}
                    onClick={() => setFiltroPrioridad(filtroPrioridad === prioridad ? null : prioridad)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                      filtroPrioridad === prioridad
                        ? 'bg-primary-600 text-white'
                        : PRIORIDAD_CONFIG[prioridad].color + ' hover:opacity-80'
                    )}
                  >
                    {PRIORIDAD_CONFIG[prioridad].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de solicitudes */}
      {solicitudesFiltradas.length === 0 ? (
        <div className="card text-center py-12">
          <Wrench className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="font-medium text-neutral-900 dark:text-white">
            {solicitudes.length === 0 ? 'Sin solicitudes de mantención' : 'Sin resultados'}
          </h3>
          <p className="text-neutral-500 text-sm mt-1">
            {solicitudes.length === 0
              ? 'Crea la primera solicitud de mantención del condominio'
              : 'Intenta con otros filtros o términos de búsqueda'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {solicitudesFiltradas.map((solicitud) => {
            const estadoConf = ESTADO_CONFIG[solicitud.estado as keyof typeof ESTADO_CONFIG]
            const prioridadConf = PRIORIDAD_CONFIG[solicitud.prioridad as keyof typeof PRIORIDAD_CONFIG]
            const categoriaLabel = CATEGORIA_LABELS[solicitud.categoria as keyof typeof CATEGORIA_LABELS] || solicitud.categoria

            return (
              <div
                key={solicitud.id}
                className="card hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-elevated transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {/* Prioridad dot */}
                  <div className={cn('mt-1 rounded-full flex-shrink-0', `h-3 w-3 ${prioridadConf.dot}`)} />

                  {/* Contenido principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                          {solicitud.titulo}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                          Unidad {solicitud.unidad_id}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className={`badge-pendiente text-xs px-2 py-1`}>
                          {estadoConf.label}
                        </span>
                        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', prioridadConf.color)}>
                          {prioridadConf.label}
                        </span>
                      </div>
                    </div>

                    {/* Descripción */}
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-2">
                      {solicitud.descripcion}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-500">
                      <span className="inline-flex items-center gap-1">
                        {categoriaLabel}
                      </span>
                      <span>·</span>
                      <span>{formatDate(solicitud.creado_en, { day: 'numeric', month: 'long', year: '2-digit' })}</span>
                      {solicitud.clasificacion_ia && (
                        <>
                          <span>·</span>
                          <span className="text-xs text-primary-600 dark:text-primary-400">
                            Clasificado: {solicitud.clasificacion_ia}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <span className="text-neutral-300 group-hover:text-neutral-500 transition-colors flex-shrink-0">→</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Results counter */}
      {solicitudesFiltradas.length > 0 && (
        <p className="text-xs text-neutral-500 text-center pt-2">
          {solicitudesFiltradas.length} de {solicitudes.length} solicitudes
        </p>
      )}
    </div>
  )
}
