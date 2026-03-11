import { createClient } from '@/lib/supabase/server'
import { formatCLP } from '@/lib/utils'
import { Plus, Users, Home, TrendingDown, DollarSign } from 'lucide-react'
import Link from 'next/link'
import type { Unidad, Perfil } from '@/types'
import CopropietariosClient from '@/components/copropietarios/CopropietariosClient'

export const metadata = { title: 'Copropietarios' }

interface UnidadConPropietario extends Unidad {
  propietario?: Perfil | null
}

export default async function CopropietariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('id, rol, condominio_id, nombre_completo')
    .eq('id', user!.id)
    .single()

  // Obtener todas las unidades con información del propietario
  const { data: unidades } = await supabase
    .from('unidades')
    .select(`
      *,
      propietario:perfiles!propietario_id(
        id,
        nombre_completo,
        telefono,
        rol
      )
    `)
    .eq('condominio_id', perfil?.condominio_id!)
    .order('numero')

  const unidadesConPropietario = (unidades as UnidadConPropietario[]) || []

  // Calcular estadísticas
  const totalUnidades = unidadesConPropietario.length
  const unidadesOcupadas = unidadesConPropietario.filter(u => u.propietario_id).length
  const unidadesMorosas = unidadesConPropietario.filter(u => u.meses_morosidad > 0).length
  const saldoTotalPendiente = unidadesConPropietario.reduce((sum, u) => sum + u.saldo_pendiente, 0)

  const puedeAgregar = ['administrador', 'superadmin'].includes(perfil?.rol ?? '')

  // Estadísticas para mostrar
  const stats = [
    {
      label: 'Total unidades',
      value: totalUnidades.toString(),
      icon: <Home className="h-5 w-5" />,
      color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20',
    },
    {
      label: 'Unidades ocupadas',
      value: unidadesOcupadas.toString(),
      icon: <Users className="h-5 w-5" />,
      color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
      sub: `${totalUnidades > 0 ? Math.round((unidadesOcupadas / totalUnidades) * 100) : 0}% ocupación`,
    },
    {
      label: 'Unidades morosas',
      value: unidadesMorosas.toString(),
      icon: <TrendingDown className="h-5 w-5" />,
      color: unidadesMorosas === 0 ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'Saldo pendiente total',
      value: formatCLP(saldoTotalPendiente),
      icon: <DollarSign className="h-5 w-5" />,
      color: saldoTotalPendiente === 0 ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Copropietarios</h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-0.5">
            Directorio de propietarios y estado de unidades
          </p>
        </div>
        {puedeAgregar && (
          <Link href="/dashboard/copropietarios/nueva" className="btn-primary">
            <Plus className="h-4 w-4" />
            Agregar unidad
          </Link>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  {stat.value}
                </p>
                {stat.sub && (
                  <p className="text-xs text-neutral-500 mt-1">{stat.sub}</p>
                )}
              </div>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and filter client component */}
      <CopropietariosClient unidades={unidadesConPropietario} />
    </div>
  )
}
