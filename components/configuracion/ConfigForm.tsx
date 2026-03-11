'use client'

import { useState } from 'react'
import { Save, X, Loader2, Edit2, Toggle2, Mail, MessageCircle } from 'lucide-react'
import type { Condominio } from '@/types'

interface ConfigFormProps {
  section: 'condominio' | 'gastos' | 'administrador' | 'agentes' | 'notificaciones'
  condominio: Condominio
  isSuperAdmin: boolean
}

const AGENTES = [
  { id: 'administrador', nombre: 'Agente Administrador', descripcion: 'Gestión administrativa y certificados' },
  { id: 'tesorero', nombre: 'Agente Tesorero', descripcion: 'Análisis financiero y presupuesto' },
  { id: 'secretario', nombre: 'Agente Secretario', descripcion: 'Documentos y comunicaciones' },
]

export function ConfigForm({ section, condominio, isSuperAdmin }: ConfigFormProps) {
  const [editando, setEditando] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState(() => {
    switch (section) {
      case 'condominio':
        return {
          nombre: condominio.nombre,
          direccion: condominio.direccion,
          comuna: condominio.comuna,
          region: condominio.region,
          total_unidades: condominio.total_unidades.toString(),
          rut_comunidad: condominio.rut_comunidad || '',
        }
      case 'gastos':
        return {
          monto_base_mensual: '0',
          fecha_vencimiento_default: '5',
          fondo_reserva_porcentaje: '20',
        }
      case 'administrador':
        return {
          administrador_nombre: condominio.administrador_nombre || '',
          administrador_rut: condominio.administrador_rut || '',
          administrador_vigencia: condominio.administrador_vigencia?.split('T')[0] || '',
        }
      case 'agentes':
        return {
          agente_administrador: true,
          agente_tesorero: true,
          agente_secretario: true,
        }
      case 'notificaciones':
        return {
          notificaciones_email: true,
          notificaciones_whatsapp: false,
        }
      default:
        return {}
    }
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, type, value } = e.target
    const inputElement = e.target as HTMLInputElement
    const checked = inputElement.checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/configuracion/actualizar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data: formData }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar configuración')
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
    setEditando(false)
    setError(null)
  }

  const renderContent = () => {
    if (section === 'condominio') {
      const data = formData as Record<string, string>
      return editando ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
              Nombre del Condominio
            </label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              value={data.nombre}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="rut_comunidad" className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
              RUT Comunidad
            </label>
            <input
              id="rut_comunidad"
              type="text"
              name="rut_comunidad"
              value={data.rut_comunidad}
              onChange={handleChange}
              placeholder="XX.XXX.XXX-X"
              className="input w-full"
            />
          </div>
          <div>
            <label htmlFor="direccion" className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
              Dirección
            </label>
            <input
              id="direccion"
              type="text"
              name="direccion"
              value={data.direccion}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="comuna" className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                Comuna
              </label>
              <input
                id="comuna"
                type="text"
                name="comuna"
                value={data.comuna}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                Región
              </label>
              <input
                id="region"
                type="text"
                name="region"
                value={data.region}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="total_unidades" className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
              Total de Unidades
            </label>
            <input
              id="total_unidades"
              type="number"
              name="total_unidades"
              value={data.total_unidades}
              onChange={handleChange}
              min="1"
              className="input w-full"
              required
            />
          </div>
          {renderActions()}
        </form>
      ) : (
        <>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-neutral-500 mb-1">Nombre</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">{data.nombre}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">RUT Comunidad</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">{data.rut_comunidad || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Dirección</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">{data.direccion}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Comuna / Región</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {data.comuna}, {data.region}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Total de Unidades</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">{data.total_unidades}</p>
            </div>
          </div>
          {!editando && !isSuperAdmin && (
            <p className="text-xs text-neutral-500 mt-3">
              Requiere permisos de Súper Administrador
            </p>
          )}
        </>
      )
    }

    if (section === 'gastos') {
      const data = formData as Record<string, string>
      return editando ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="monto_base_mensual" className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
              Monto Base Mensual
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-neutral-600 dark:text-neutral-400">$</span>
              <input
                id="monto_base_mensual"
                type="number"
                name="monto_base_mensual"
                value={data.monto_base_mensual}
                onChange={handleChange}
                className="input w-full pl-7"
                min="0"
                step="1000"
              />
            </div>
          </div>
          <div>
            <label htmlFor="fecha_vencimiento_default" className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
              Fecha de Vencimiento Default (día del mes)
            </label>
            <input
              id="fecha_vencimiento_default"
              type="number"
              name="fecha_vencimiento_default"
              value={data.fecha_vencimiento_default}
              onChange={handleChange}
              min="1"
              max="31"
              className="input w-full"
            />
          </div>
          <div>
            <label htmlFor="fondo_reserva_porcentaje" className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
              Porcentaje Fondo de Reserva
            </label>
            <div className="relative">
              <input
                id="fondo_reserva_porcentaje"
                type="number"
                name="fondo_reserva_porcentaje"
                value={data.fondo_reserva_porcentaje}
                onChange={handleChange}
                min="0"
                max="100"
                className="input w-full pr-7"
              />
              <span className="absolute right-3 top-2.5 text-neutral-600 dark:text-neutral-400">%</span>
            </div>
          </div>
          {renderActions()}
        </form>
      ) : (
        <>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-neutral-500 mb-1">Monto Base Mensual</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                ${parseInt(data.monto_base_mensual).toLocaleString('es-CL')}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Vencimiento Default</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                Día {data.fecha_vencimiento_default} de cada mes
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Fondo de Reserva</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {data.fondo_reserva_porcentaje}% de los ingresos
              </p>
            </div>
          </div>
        </>
      )
    }

    if (section === 'administrador') {
      const data = formData as Record<string, string>
      return editando ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="administrador_nombre" className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
              Nombre Administrador
            </label>
            <input
              id="administrador_nombre"
              type="text"
              name="administrador_nombre"
              value={data.administrador_nombre}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label htmlFor="administrador_rut" className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
              RUT Administrador
            </label>
            <input
              id="administrador_rut"
              type="text"
              name="administrador_rut"
              value={data.administrador_rut}
              onChange={handleChange}
              placeholder="XX.XXX.XXX-X"
              className="input w-full"
            />
          </div>
          <div>
            <label htmlFor="administrador_vigencia" className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
              Vigencia Certificado
            </label>
            <input
              id="administrador_vigencia"
              type="date"
              name="administrador_vigencia"
              value={data.administrador_vigencia}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          {renderActions()}
        </form>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-neutral-500">Consulta la sección "Administrador Certificado" arriba para ver datos actuales</p>
        </div>
      )
    }

    if (section === 'agentes') {
      const data = formData as Record<string, boolean>
      return editando ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {AGENTES.map((agente) => (
            <label key={agente.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name={`agente_${agente.id}`}
                checked={data[`agente_${agente.id}`] ?? true}
                onChange={handleChange}
                className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600"
              />
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{agente.nombre}</p>
                <p className="text-xs text-neutral-500">{agente.descripcion}</p>
              </div>
            </label>
          ))}
          {renderActions()}
        </form>
      ) : (
        <div className="space-y-3">
          {AGENTES.map((agente) => (
            <div key={agente.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{agente.nombre}</p>
                <p className="text-xs text-neutral-500">{agente.descripcion}</p>
              </div>
              <div
                className="h-5 w-9 rounded-full transition-colors flex items-center px-0.5"
                style={{ backgroundColor: data[`agente_${agente.id}`] ? '#3b82f6' : '#d1d5db' }}>
                <div
                  className="h-4 w-4 rounded-full bg-white transition-transform"
                  style={{ transform: data[`agente_${agente.id}`] ? 'translateX(18px)' : 'none' }}
                />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (section === 'notificaciones') {
      const data = formData as Record<string, boolean>
      return editando ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">Notificaciones por Email</p>
              <p className="text-xs text-neutral-500">Recibe alertas de asambleas, gastos y circulares</p>
            </div>
            <input
              type="checkbox"
              name="notificaciones_email"
              checked={data.notificaciones_email}
              onChange={handleChange}
              className="w-4 h-4"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">Notificaciones por WhatsApp</p>
              <p className="text-xs text-neutral-500">Próximamente disponible</p>
            </div>
            <input
              type="checkbox"
              name="notificaciones_whatsapp"
              checked={data.notificaciones_whatsapp}
              onChange={handleChange}
              disabled
              className="w-4 h-4 opacity-50"
            />
          </label>
          {renderActions()}
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-neutral-500" />
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">Email</p>
                <p className="text-xs text-neutral-500">Alertas y comunicados</p>
              </div>
            </div>
            <div
              className="h-5 w-9 rounded-full transition-colors flex items-center px-0.5"
              style={{ backgroundColor: data.notificaciones_email ? '#3b82f6' : '#d1d5db' }}>
              <div
                className="h-4 w-4 rounded-full bg-white transition-transform"
                style={{ transform: data.notificaciones_email ? 'translateX(18px)' : 'none' }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 opacity-50">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-neutral-500" />
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">WhatsApp</p>
                <p className="text-xs text-neutral-500">Próximamente</p>
              </div>
            </div>
            <div className="h-5 w-9 rounded-full bg-neutral-300 flex items-center px-0.5">
              <div className="h-4 w-4 rounded-full bg-white" />
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  const renderActions = () => (
    <>
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-300">
          Configuración actualizada correctamente
        </div>
      )}
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={cargando} className="btn-primary text-sm gap-1.5 flex-1">
          {cargando ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar
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
    </>
  )

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        {editando ? (
          <h3 className="font-semibold text-neutral-900 dark:text-white">Editar configuración</h3>
        ) : (
          <>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Configuración actual</h3>
            {isSuperAdmin || section !== 'condominio' ? (
              <button
                onClick={() => setEditando(true)}
                className="btn-secondary text-sm gap-1.5"
              >
                <Edit2 className="h-4 w-4" />
                Editar
              </button>
            ) : null}
          </>
        )}
      </div>

      {renderContent()}
    </div>
  )
}
