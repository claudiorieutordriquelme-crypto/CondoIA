'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GastoComun, GastoEstado } from '@/types'
import { formatCLP, formatDate, formatPeriodo, percentage } from '@/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Plus,
  X,
  Search,
  Loader2,
} from 'lucide-react'

interface GastoConUnidad extends GastoComun {
  unidades?: { numero: string; tipo: string; piso?: number } | null
}

interface GastosClientProps {
  gastos: GastoConUnidad[]
  periodo: string
  canCreate: boolean
  userRole: string
}

const ESTADO_CONFIG: Record<GastoEstado, { label: string; icon: React.ReactNode; class: string }> = {
  pendiente: {
    label: 'Pendiente',
    icon: <Clock className="h-4 w-4" />,
    class: 'badge-pendiente',
  },
  pagado: {
    label: 'Pagado',
    icon: <CheckCircle2 className="h-4 w-4" />,
    class: 'badge-pagado',
  },
  vencido: {
    label: 'Vencido',
    icon: <AlertTriangle className="h-4 w-4" />,
    class: 'badge-vencido',
  },
  en_cobranza: {
    label: 'En cobranza',
    icon: <AlertOctagon className="h-4 w-4" />,
    class: 'badge-cobranza',
  },
}

export default function GastosClient({
  gastos,
  periodo,
  canCreate,
  userRole,
}: GastosClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedEstado, setSelectedEstado] = useState<GastoEstado | null>(
    (searchParams.get('estado') as GastoEstado) || null
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [showGenerarModal, setShowGenerarModal] = useState(false)
  const [showPagarModal, setShowPagarModal] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state para generar gastos
  const [generarForm, setGenerarForm] = useState({
    monto_base: '',
    monto_extra: '',
    fecha_vencimiento: '',
    notas: '',
  })

  // Form state para pago
  const [pagarForm, setPagarForm] = useState({
    metodo_pago: 'transferencia',
    comprobante_url: '',
  })

  const filteredGastos = gastos.filter((g) => {
    const matchEstado = !selectedEstado || g.estado === selectedEstado
    const matchSearch = !searchTerm || g.unidades?.numero?.includes(searchTerm)
    return matchEstado && matchSearch
  })

  const handlePeriodoChange = useCallback((offset: number) => {
    const [year, month] = periodo.split('-').map(Number)
    let newMonth = month + offset
    let newYear = year

    if (newMonth > 12) {
      newMonth = 1
      newYear++
    } else if (newMonth < 1) {
      newMonth = 12
      newYear--
    }

    const newPeriodo = `${newYear}-${String(newMonth).padStart(2, '0')}`
    router.push(`/dashboard/gastos?periodo=${newPeriodo}`)
  }, [periodo, router])

  const handleEstadoFilter = useCallback((estado: GastoEstado | null) => {
    setSelectedEstado(estado)
    const params = new URLSearchParams(searchParams)
    if (estado) {
      params.set('estado', estado)
    } else {
      params.delete('estado')
    }
    router.push(`/dashboard/gastos?${params.toString()}`)
  }, [searchParams, router])

  const handleGenerarGastos = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/gastos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodo,
          generar_todos: true,
          monto_base: parseFloat(generarForm.monto_base),
          monto_extra: parseFloat(generarForm.monto_extra) || 0,
          fecha_vencimiento: generarForm.fecha_vencimiento,
          notas: generarForm.notas || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al generar gastos')
      }

      setGenerarForm({ monto_base: '', monto_extra: '', fecha_vencimiento: '', notas: '' })
      setShowGenerarModal(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarcarPago = async (gastoId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/gastos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: gastoId,
          estado: 'pagado',
          metodo_pago: pagarForm.metodo_pago,
          comprobante_url: pagarForm.comprobante_url || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al registrar pago')
      }

      setPagarForm({ metodo_pago: 'transferencia', comprobante_url: '' })
      setShowPagarModal(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  // Estadísticas
  const totalEmitido = filteredGastos.reduce((sum, g) => sum + g.monto_total, 0)
  const totalRecaudado = filteredGastos
    .filter((g) => g.estado === 'pagado')
    .reduce((sum, g) => sum + g.monto_total, 0)
  const totalPendiente = filteredGastos
    .filter((g) => ['pendiente', 'vencido', 'en_cobranza'].includes(g.estado))
    .reduce((sum, g) => sum + g.monto_total, 0)
  const tasaPago = filteredGastos.length > 0 ? percentage(
    filteredGastos.filter((g) => g.estado === 'pagado').length,
    filteredGastos.length
  ) : 0

  return (
    <div className="space-y-6">
      {/* Period Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handlePeriodoChange(-1)}
            className="btn-secondary p-2.5"
            aria-label="Período anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center min-w-[200px]">
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {formatPeriodo(periodo)}
            </p>
          </div>
          <button
            onClick={() => handlePeriodoChange(1)}
            className="btn-secondary p-2.5"
            aria-label="Próximo período"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {canCreate && (
          <button
            onClick={() => setShowGenerarModal(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            Generar gastos del período
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total emitido', value: formatCLP(totalEmitido), color: 'bg-blue-50 dark:bg-blue-900/10' },
          { label: 'Recaudado', value: formatCLP(totalRecaudado), color: 'bg-green-50 dark:bg-green-900/10' },
          { label: 'Pendiente', value: formatCLP(totalPendiente), color: 'bg-yellow-50 dark:bg-yellow-900/10' },
          { label: 'Tasa de pago', value: `${tasaPago}%`, color: 'bg-primary-50 dark:bg-primary-900/10' },
        ].map((stat) => (
          <div key={stat.label} className={`card ${stat.color}`}>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por unidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleEstadoFilter(null)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedEstado === null
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            Todos
          </button>
          {(Object.keys(ESTADO_CONFIG) as GastoEstado[]).map((estado) => (
            <button
              key={estado}
              onClick={() => handleEstadoFilter(estado)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedEstado === estado
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {ESTADO_CONFIG[estado].label}
            </button>
          ))}
        </div>
      </div>

      {/* Gastos List/Table */}
      {filteredGastos.length === 0 ? (
        <div className="card text-center py-12">
          <AlertTriangle className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="font-medium text-neutral-900 dark:text-white">
            {gastos.length === 0 ? 'Sin gastos registrados' : 'Sin gastos en este período'}
          </h3>
          <p className="text-neutral-500 text-sm mt-1">
            {gastos.length === 0 && canCreate
              ? 'Crea gastos del período para comenzar'
              : 'Ajusta los filtros e intenta de nuevo'}
          </p>
          {gastos.length === 0 && canCreate && (
            <button
              onClick={() => setShowGenerarModal(true)}
              className="btn-primary mt-4 inline-flex"
            >
              <Plus className="h-4 w-4" />
              Generar gastos del período
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGastos.map((gasto) => {
            const estadoConf = ESTADO_CONFIG[gasto.estado]
            return (
              <div
                key={gasto.id}
                className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:shadow-elevated transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <p className="font-semibold text-neutral-900 dark:text-white">
                      Unidad {gasto.unidades?.numero}
                    </p>
                    <span className={`${estadoConf.class} flex items-center gap-1`}>
                      {estadoConf.icon}
                      {estadoConf.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-neutral-500 dark:text-neutral-400">Período</p>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {formatPeriodo(gasto.periodo)}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500 dark:text-neutral-400">Monto</p>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {formatCLP(gasto.monto_total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500 dark:text-neutral-400">Vencimiento</p>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {formatDate(gasto.fecha_vencimiento, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    {gasto.fecha_pago && (
                      <div>
                        <p className="text-neutral-500 dark:text-neutral-400">Fecha pago</p>
                        <p className="font-medium text-neutral-900 dark:text-white">
                          {formatDate(gasto.fecha_pago, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  {gasto.estado !== 'pagado' && canCreate && (
                    <button
                      onClick={() => setShowPagarModal(gasto.id)}
                      className="btn-secondary text-sm py-2 px-3"
                      aria-label={`Marcar unidad ${gasto.unidades?.numero} como pagada`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Marcar pagado
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal: Generar gastos */}
      {showGenerarModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Generar gastos del período
              </h2>
              <button
                onClick={() => setShowGenerarModal(false)}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 text-sm text-red-800 dark:text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleGenerarGastos} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Monto base (CLP) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={generarForm.monto_base}
                  onChange={(e) => setGenerarForm({ ...generarForm, monto_base: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Monto extra (CLP)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={generarForm.monto_extra}
                  onChange={(e) => setGenerarForm({ ...generarForm, monto_extra: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Fecha vencimiento *
                </label>
                <input
                  type="date"
                  value={generarForm.fecha_vencimiento}
                  onChange={(e) => setGenerarForm({ ...generarForm, fecha_vencimiento: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Notas
                </label>
                <textarea
                  value={generarForm.notas}
                  onChange={(e) => setGenerarForm({ ...generarForm, notas: e.target.value })}
                  className="input resize-none"
                  rows={2}
                  maxLength={500}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGenerarModal(false)}
                  className="btn-secondary flex-1"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    'Generar para todas'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Marcar como pagado */}
      {showPagarModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Registrar pago
              </h2>
              <button
                onClick={() => setShowPagarModal(null)}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 text-sm text-red-800 dark:text-red-200">
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleMarcarPago(showPagarModal)
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Método de pago *
                </label>
                <select
                  value={pagarForm.metodo_pago}
                  onChange={(e) => setPagarForm({ ...pagarForm, metodo_pago: e.target.value })}
                  className="input"
                  required
                >
                  <option value="transferencia">Transferencia bancaria</option>
                  <option value="cheque">Cheque</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta de crédito</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  URL del comprobante
                </label>
                <input
                  type="url"
                  value={pagarForm.comprobante_url}
                  onChange={(e) => setPagarForm({ ...pagarForm, comprobante_url: e.target.value })}
                  className="input"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPagarModal(null)}
                  className="btn-secondary flex-1"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    'Registrar pago'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
