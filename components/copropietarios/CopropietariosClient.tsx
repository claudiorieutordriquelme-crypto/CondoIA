'use client'

import { useState, useMemo } from 'react'
import { Search, AlertCircle, CheckCircle2, Phone, MapPin } from 'lucide-react'
import { cn, formatCLP, truncate } from '@/lib/utils'
import type { Unidad, Perfil } from '@/types'

interface UnidadConPropietario extends Unidad {
  propietario?: Perfil | null
}

interface CopropietariosClientProps {
  unidades: UnidadConPropietario[]
}

export default function CopropietariosClient({ unidades }: CopropietariosClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMorosidad, setFilterMorosidad] = useState<'todos' | 'morosos' | 'pagos'>('todos')

  // Filtrar y buscar unidades
  const unidadesFiltradas = useMemo(() => {
    return unidades.filter((unidad) => {
      // Filtro de búsqueda (nombre, número unidad)
      const searchLower = searchTerm.toLowerCase()
      const matchSearch =
        !searchTerm ||
        unidad.numero.toLowerCase().includes(searchLower) ||
        unidad.propietario?.nombre_completo?.toLowerCase().includes(searchLower)

      // Filtro de morosidad
      let matchMorosidad = true
      if (filterMorosidad === 'morosos') {
        matchMorosidad = unidad.meses_morosidad > 0
      } else if (filterMorosidad === 'pagos') {
        matchMorosidad = unidad.meses_morosidad === 0 && !!unidad.propietario_id
      }

      return matchSearch && matchMorosidad
    })
  }, [unidades, searchTerm, filterMorosidad])

  // Obtener estado de morosidad
  const getMorosidadStatus = (mesesMorosidad: number) => {
    if (mesesMorosidad === 0) {
      return {
        label: 'Al día',
        color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800',
        icon: <CheckCircle2 className="h-4 w-4" />,
      }
    } else if (mesesMorosidad === 1) {
      return {
        label: '1 mes vencido',
        color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
        icon: <AlertCircle className="h-4 w-4" />,
      }
    } else if (mesesMorosidad <= 3) {
      return {
        label: `${mesesMorosidad} meses vencidos`,
        color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
        icon: <AlertCircle className="h-4 w-4" />,
      }
    } else {
      return {
        label: `${mesesMorosidad} meses vencidos`,
        color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
        icon: <AlertCircle className="h-4 w-4" />,
      }
    }
  }

  const getTipoLabel = (tipo: string) => {
    const tipoLabels: Record<string, string> = {
      departamento: 'Departamento',
      casa: 'Casa',
      local: 'Local',
      estacionamiento: 'Estacionamiento',
      bodega: 'Bodega',
    }
    return tipoLabels[tipo] || tipo
  }

  return (
    <div className="space-y-4">
      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por número de unidad o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
            aria-label="Buscar copropietarios"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          {(
            [
              { value: 'todos' as const, label: 'Todos' },
              { value: 'pagos' as const, label: 'Al día' },
              { value: 'morosos' as const, label: 'Morosos' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterMorosidad(filter.value)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                filterMorosidad === filter.value
                  ? 'btn-primary'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Units grid/list */}
      {unidadesFiltradas.length === 0 ? (
        <div className="card text-center py-12">
          <MapPin className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <h3 className="font-medium text-neutral-900 dark:text-white">
            {searchTerm ? 'Sin resultados' : 'Sin copropietarios'}
          </h3>
          <p className="text-neutral-500 text-sm mt-1">
            {searchTerm
              ? `No se encontraron copropietarios que coincidan con "${searchTerm}"`
              : 'No hay unidades registradas en el sistema'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unidadesFiltradas.map((unidad) => {
            const morosidadStatus = getMorosidadStatus(unidad.meses_morosidad)
            const hasPropietario = !!unidad.propietario

            return (
              <div
                key={unidad.id}
                className="card hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-elevated transition-all"
              >
                {/* Header with unit number and status */}
                <div className="flex items-start justify-between mb-3 pb-3 border-b border-neutral-200 dark:border-neutral-700">
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Unidad</p>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                      {unidad.numero}
                    </h3>
                  </div>
                  <div className={cn('px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1', morosidadStatus.color)}>
                    {morosidadStatus.icon}
                    {morosidadStatus.label}
                  </div>
                </div>

                {/* Unit details */}
                <div className="space-y-2 mb-4 text-sm">
                  {unidad.piso && (
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                      <span className="text-neutral-400 dark:text-neutral-600 w-4">·</span>
                      <span>
                        <span className="font-medium">Piso:</span> {unidad.piso}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <span className="text-neutral-400 dark:text-neutral-600 w-4">·</span>
                    <span>
                      <span className="font-medium">Tipo:</span> {getTipoLabel(unidad.tipo)}
                    </span>
                  </div>
                  {unidad.metros_cuadrados && (
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                      <span className="text-neutral-400 dark:text-neutral-600 w-4">·</span>
                      <span>
                        <span className="font-medium">Área:</span> {unidad.metros_cuadrados} m²
                      </span>
                    </div>
                  )}
                </div>

                {/* Propietario info */}
                {hasPropietario ? (
                  <div className="space-y-3 mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Propietario</p>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {truncate(unidad.propietario?.nombre_completo || 'Sin nombre', 30)}
                      </p>
                    </div>
                    {unidad.propietario?.telefono && (
                      <a
                        href={`tel:${unidad.propietario.telefono}`}
                        className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 min-h-[44px] px-2 -mx-2 rounded transition-colors"
                      >
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        {unidad.propietario.telefono}
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700 py-2">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Sin propietario asignado
                    </p>
                  </div>
                )}

                {/* Financial info */}
                <div className="space-y-2">
                  {unidad.saldo_pendiente > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Saldo pendiente:</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {formatCLP(unidad.saldo_pendiente)}
                      </span>
                    </div>
                  )}
                  {unidad.saldo_pendiente === 0 && hasPropietario && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Estado:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        Sin deuda
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Results summary */}
      {unidadesFiltradas.length > 0 && (
        <div className="text-center text-sm text-neutral-500 dark:text-neutral-400 pt-2">
          Mostrando {unidadesFiltradas.length} de {unidades.length} unidad{unidades.length !== 1 ? 'es' : ''}
        </div>
      )}
    </div>
  )
}
