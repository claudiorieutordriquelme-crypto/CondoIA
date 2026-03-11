import { createClient } from '@/lib/supabase/server'
import { formatCLP, percentage } from '@/lib/utils'
import {
  Building2, DollarSign, AlertTriangle, Users,
  CalendarCheck, TrendingUp, ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'
import QuickAccessPanel from '@/components/dashboard/QuickAccessPanel'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*, condominios(*)')
    .eq('id', user!.id)
    .single()

  const condominioId = perfil?.condominio_id
  const condominio = perfil?.condominios as Record<string, unknown> | null

  // Obtener estadísticas del período actual
  const periodoActual = new Date().toISOString().slice(0, 7)

  const [{ data: gastos }, { data: unidades }, { data: proxAsamblea }] = await Promise.all([
    supabase
      .from('gastos_comunes')
      .select('estado, monto_total, monto_base')
      .eq('condominio_id', condominioId!)
      .eq('periodo', periodoActual),
    supabase
      .from('unidades')
      .select('saldo_pendiente, meses_morosidad')
      .eq('condominio_id', condominioId!),
    supabase
      .from('asambleas')
      .select('titulo, fecha_convocatoria, tipo')
      .eq('condominio_id', condominioId!)
      .in('estado', ['convocada', 'en_curso'])
      .order('fecha_convocatoria', { ascending: true })
      .limit(1)
      .single(),
  ])

  const totalGastos = gastos?.length ?? 0
  const gastosPageados = gastos?.filter((g) => g.estado === 'pagado').length ?? 0
  const recaudacion = gastos?.filter((g) => g.estado === 'pagado').reduce((s, g) => s + g.monto_total, 0) ?? 0
  const esperado = gastos?.reduce((s, g) => s + g.monto_total, 0) ?? 0
  const unidadesMorosas = unidades?.filter((u) => u.meses_morosidad > 0).length ?? 0
  const totalUnidades = unidades?.length ?? 0
  const tasaPago = percentage(gastosPageados, totalGastos)

  const stats = [
    {
      label: 'Recaudación del mes',
      value: formatCLP(recaudacion),
      sub: `de ${formatCLP(esperado)} esperado`,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
      change: `${tasaPago}% cobrado`,
    },
    {
      label: 'Tasa de pago',
      value: `${tasaPago}%`,
      sub: `${gastosPageados} de ${totalGastos} unidades`,
      icon: <TrendingUp className="h-5 w-5" />,
      color: tasaPago >= 80 ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50',
      change: tasaPago >= 80 ? 'En objetivo' : 'Bajo la meta',
    },
    {
      label: 'Unidades morosas',
      value: unidadesMorosas.toString(),
      sub: `de ${totalUnidades} unidades`,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: unidadesMorosas === 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50 dark:bg-red-900/20',
      change: unidadesMorosas === 0 ? 'Sin morosidad' : 'Requiere atención',
    },
    {
      label: 'Total unidades',
      value: totalUnidades.toString(),
      sub: 'registradas en plataforma',
      icon: <Users className="h-5 w-5" />,
      color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20',
      change: 'Activas',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Bienvenido, {perfil?.nombre_completo?.split(' ')[0] ?? 'Usuario'} 👋
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          {condominio ? (condominio.nombre as string) : 'Sin condominio asignado'} —{' '}
          {new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Próxima asamblea banner */}
      {proxAsamblea && (
        <div className="flex items-center gap-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl px-4 py-3">
          <CalendarCheck className="h-5 w-5 text-primary-600 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-medium text-primary-800 dark:text-primary-200">
              Próxima asamblea:{' '}
            </span>
            <span className="text-sm text-primary-700 dark:text-primary-300">
              {proxAsamblea.titulo as string} —{' '}
              {new Date(proxAsamblea.fecha_convocatoria as string).toLocaleDateString('es-CL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </span>
          </div>
          <Link href="/dashboard/asambleas" className="text-sm font-medium text-primary-600 hover:underline">
            Ver →
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-neutral-500 mt-1">{stat.sub}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <p className={`text-xs font-medium mt-3 ${stat.color.split(' ')[0]}`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Acceso rápido: Portón, Cámaras, Pago */}
      <QuickAccessPanel />

      {/* Acciones rápidas por rol */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Acceso a Agentes IA */}
        {['administrador', 'tesorero', 'secretario', 'superadmin'].includes(perfil?.rol ?? '') && (
          <div className="card bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-700">
            <h2 className="font-semibold text-neutral-900 dark:text-white mb-1">
              Agentes IA disponibles
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Administrador · Tesorero · Secretario — disponibles 24/7
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Administrador', href: '/dashboard/agentes?agente=administrador' },
                { name: 'Tesorero', href: '/dashboard/agentes?agente=tesorero' },
                { name: 'Secretario', href: '/dashboard/agentes?agente=secretario' },
              ].map((a) => (
                <Link key={a.name} href={a.href} className="btn-primary text-sm py-2 px-3">
                  {a.name} IA
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="card">
          <h2 className="font-semibold text-neutral-900 dark:text-white mb-3">
            Acciones rápidas
          </h2>
          <div className="space-y-2">
            {[
              { label: 'Ver gastos comunes', href: '/dashboard/gastos', icon: <DollarSign className="h-4 w-4" /> },
              { label: 'Documentos', href: '/dashboard/documentos', icon: <Building2 className="h-4 w-4" /> },
              { label: 'Solicitudes de mantención', href: '/dashboard/mantenimiento', icon: <AlertTriangle className="h-4 w-4" /> },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 group transition-colors"
              >
                <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <span className="text-neutral-400">{item.icon}</span>
                  {item.label}
                </div>
                <ArrowUpRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
