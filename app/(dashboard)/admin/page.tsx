import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ShieldCheck, Users, Building2, Activity, BarChart3 } from 'lucide-react'
import AdminClient from '@/components/admin/AdminClient'

export const metadata = { title: 'Panel de Administración' }

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!perfil || !['superadmin', 'administrador'].includes(perfil.rol)) {
    redirect('/dashboard')
  }

  const condominioId = perfil.condominio_id

  const { data: usuarios } = await supabase
    .from('perfiles')
    .select('*')
    .eq('condominio_id', condominioId)
    .order('nombre_completo')

  const { data: gastos } = await supabase
    .from('gastos_comunes')
    .select('monto_total, estado')
    .eq('condominio_id', condominioId)

  const { data: unidades } = await supabase
    .from('unidades')
    .select('id')
    .eq('condominio_id', condominioId)

  const { data: solicitudes } = await supabase
    .from('solicitudes_mantenimiento')
    .select('id, estado')
    .eq('condominio_id', condominioId)
    .in('estado', ['pendiente', 'asignada'])

  const totalUsuarios = usuarios?.length ?? 0
  const unidadesActivas = unidades?.length ?? 0
  const gastosPendientes = gastos?.filter((g) => g.estado !== 'pagado').length ?? 0
  const solicitudesAbiertas = solicitudes?.length ?? 0

  const stats = [
    {
      label: 'Total de usuarios',
      value: totalUsuarios.toString(),
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Unidades activas',
      value: unidadesActivas.toString(),
      icon: <Building2 className="h-5 w-5" />,
      color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Gastos pendientes',
      value: gastosPendientes.toString(),
      icon: <Activity className="h-5 w-5" />,
      color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
    },
    {
      label: 'Solicitudes abiertas',
      value: solicitudesAbiertas.toString(),
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-primary-50 dark:bg-primary-900/20">
          <ShieldCheck className="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Panel de Administración
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            Gestiona usuarios, roles y configuración del condominio
          </p>
        </div>
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

      {/* Admin Client */}
      <AdminClient usuarios={usuarios || []} perfil={perfil} />
    </div>
  )
}
