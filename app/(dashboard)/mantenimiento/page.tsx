import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Wrench, Plus, Clock, CheckCircle2, AlertTriangle, AlertCircle, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { MantenimientoClient } from '@/components/mantenimiento/MantenimientoClient'
import type { SolicitudMantenimiento } from '@/types'

export const metadata = { title: 'Solicitudes de Mantención' }

const ESTADO_CONFIG = {
  abierta: { label: 'Abierta', icon: <AlertCircle className="h-4 w-4" />, class: 'badge-pendiente' },
  en_progreso: { label: 'En progreso', icon: <Clock className="h-4 w-4" />, class: 'badge-cobranza' },
  resuelta: { label: 'Resuelta', icon: <CheckCircle2 className="h-4 w-4" />, class: 'badge-pagado' },
  cerrada: { label: 'Cerrada', icon: <CheckCircle2 className="h-4 w-4" />, class: 'badge-pagado' },
}

const PRIORIDAD_CONFIG = {
  baja: { label: 'Baja', color: 'bg-green-500' },
  media: { label: 'Media', color: 'bg-yellow-500' },
  alta: { label: 'Alta', color: 'bg-orange-500' },
  urgente: { label: 'Urgente', color: 'bg-red-500' },
}

const CATEGORIA_LABELS = {
  plomeria: 'Plomería',
  electricidad: 'Electricidad',
  areas_comunes: 'Áreas comunes',
  ascensor: 'Ascensor',
  limpieza: 'Limpieza',
  otro: 'Otro',
}

export default async function MantenimientoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol, condominio_id')
    .eq('id', user!.id)
    .single()

  const { data: solicitudes } = await supabase
    .from('solicitudes_mantenimiento')
    .select('*')
    .eq('condominio_id', perfil?.condominio_id!)
    .order('creado_en', { ascending: false })
    .limit(50)

  // Calculate stats
  const abiertas = solicitudes?.filter((s) => s.estado === 'abierta').length ?? 0
  const enProgreso = solicitudes?.filter((s) => s.estado === 'en_progreso').length ?? 0
  const resueltas = solicitudes?.filter((s) => {
    const createdMonth = new Date(s.creado_en).toISOString().slice(0, 7)
    const currentMonth = new Date().toISOString().slice(0, 7)
    return (s.estado === 'resuelta' || s.estado === 'cerrada') && createdMonth === currentMonth
  }).length ?? 0

  // Calculate average resolution time (mock: 48 hours)
  const tiempoPromedioResolucion = '48 horas'

  const stats = [
    {
      label: 'Solicitudes abiertas',
      value: abiertas.toString(),
      icon: <Wrench className="h-5 w-5" />,
      color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
    },
    {
      label: 'En progreso',
      value: enProgreso.toString(),
      icon: <Clock className="h-5 w-5" />,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Resueltas este mes',
      value: resueltas.toString(),
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Tiempo promedio resolución',
      value: tiempoPromedioResolucion,
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20',
    },
  ]

  const puedeCrear = true // All roles can create

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Solicitudes de Mantención</h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-0.5">
            Gestión de solicitudes y seguimiento de trabajos
          </p>
        </div>
        {puedeCrear && (
          <Link href="/dashboard/mantenimiento/nueva" className="btn-primary">
            <Plus className="h-4 w-4" />
            Nueva solicitud
          </Link>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Client Component with filters and list */}
      <MantenimientoClient solicitudes={solicitudes as SolicitudMantenimiento[]} />
    </div>
  )
}
