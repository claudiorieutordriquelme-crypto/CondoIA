import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { CalendarDays, Plus, Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import type { Asamblea } from '@/types'

export const metadata = { title: 'Asambleas' }

const ESTADO_CONFIG = {
  convocada: { label: 'Convocada', icon: <Clock className="h-4 w-4" />, class: 'badge-pendiente' },
  en_curso: { label: 'En curso', icon: <AlertCircle className="h-4 w-4" />, class: 'badge-cobranza' },
  finalizada: { label: 'Finalizada', icon: <CheckCircle2 className="h-4 w-4" />, class: 'badge-pagado' },
  cancelada: { label: 'Cancelada', icon: <AlertCircle className="h-4 w-4" />, class: 'badge-vencido' },
}

export default async function AsambleasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol, condominio_id')
    .eq('id', user!.id)
    .single()

  const { data: asambleas } = await supabase
    .from('asambleas')
    .select('*')
    .eq('condominio_id', perfil?.condominio_id!)
    .order('fecha_convocatoria', { ascending: false })
    .limit(20)

  const puedeCrear = ['administrador', 'secretario', 'superadmin'].includes(perfil?.rol ?? '')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Asambleas</h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-0.5">
            Gestión de asambleas según Art. 17-21 Ley 21.442
          </p>
        </div>
        {puedeCrear && (
          <Link href="/dashboard/asambleas/nueva" className="btn-primary">
            <Plus className="h-4 w-4" />
            Nueva asamblea
          </Link>
        )}
      </div>

      {/* Info legal */}
      <div className="card bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <CalendarDays className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p className="font-medium">Requisitos legales Ley 21.442:</p>
            <p>• Convocatoria mínimo <strong>5 días hábiles</strong> de anticipación (Art. 17)</p>
            <p>• Segunda citación <strong>30 minutos</strong> después de la primera (Art. 18)</p>
            <p>• Quórum ordinaria: <strong>+50%</strong> de los copropietarios con derecho a voto</p>
            <p>• Acta debe registrarse en <strong>15 días hábiles</strong> (Art. 19)</p>
          </div>
        </div>
      </div>

      {/* Lista de asambleas */}
      {(!asambleas || asambleas.length === 0) ? (
        <div className="card text-center py-12">
          <CalendarDays className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="font-medium text-neutral-900 dark:text-white">Sin asambleas registradas</h3>
          <p className="text-neutral-500 text-sm mt-1">
            {puedeCrear ? 'Crea la primera asamblea del condominio' : 'No hay asambleas programadas'}
          </p>
          {puedeCrear && (
            <Link href="/dashboard/asambleas/nueva" className="btn-primary mt-4 inline-flex">
              <Plus className="h-4 w-4" />
              Crear primera asamblea
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {(asambleas as Asamblea[]).map((asamblea) => {
            const estadoConf = ESTADO_CONFIG[asamblea.estado]
            return (
              <Link
                key={asamblea.id}
                href={`/dashboard/asambleas/${asamblea.id}`}
                className="card flex items-center gap-4 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-elevated transition-all group"
              >
                {/* Fecha */}
                <div className="text-center min-w-[60px]">
                  <p className="text-2xl font-bold text-primary-600">
                    {new Date(asamblea.fecha_convocatoria).getDate()}
                  </p>
                  <p className="text-xs text-neutral-500 uppercase">
                    {new Date(asamblea.fecha_convocatoria).toLocaleDateString('es-CL', { month: 'short' })}
                  </p>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                      {asamblea.titulo}
                    </h3>
                    <span className={`${estadoConf.class} flex items-center gap-1`}>
                      {estadoConf.icon}
                      {estadoConf.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 capitalize">
                      {asamblea.tipo}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {formatDate(asamblea.fecha_convocatoria, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {asamblea.quorum_alcanzado && (
                    <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Quórum: {asamblea.quorum_alcanzado}%
                    </p>
                  )}
                </div>

                {/* Acta */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  {asamblea.acta_firmada ? (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Acta firmada
                    </span>
                  ) : asamblea.estado === 'finalizada' ? (
                    <span className="text-xs text-yellow-600 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Acta pendiente
                    </span>
                  ) : null}
                  <span className="text-neutral-300 group-hover:text-neutral-500 transition-colors">→</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
