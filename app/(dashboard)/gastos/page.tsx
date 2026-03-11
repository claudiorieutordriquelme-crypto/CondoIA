import { createClient } from '@/lib/supabase/server'
import { GastoComun, type Perfil } from '@/types'
import { DollarSign, AlertTriangle } from 'lucide-react'
import GastosClient from '@/components/gastos/GastosClient'

export const metadata = { title: 'Gastos Comunes' }

export default async function GastosPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No autenticado')
  }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol, condominio_id')
    .eq('id', user.id)
    .single() as { data: Perfil | null }

  if (!perfil) {
    throw new Error('Perfil no encontrado')
  }

  // Período del URL o actual
  const periodo = params.periodo || new Date().toISOString().slice(0, 7)

  // Validar formato de período YYYY-MM
  if (!/^\d{4}-\d{2}$/.test(periodo)) {
    throw new Error('Período inválido')
  }

  // Obtener gastos del período
  let query = supabase
    .from('gastos_comunes')
    .select('*, unidades(numero, tipo, piso)')
    .eq('condominio_id', perfil.condominio_id!)
    .eq('periodo', periodo)
    .order('creado_en', { ascending: false })

  // Copropietarios solo ven sus propios gastos
  if (['copropietario', 'arrendatario'].includes(perfil.rol)) {
    const { data: misUnidades } = await supabase
      .from('unidades')
      .select('id')
      .eq('condominio_id', perfil.condominio_id!)
      .or(`propietario_id.eq.${user.id},arrendatario_id.eq.${user.id}`)

    if (misUnidades && misUnidades.length > 0) {
      query = query.in('unidad_id', misUnidades.map((u) => u.id))
    } else {
      // Si el copropietario no tiene unidades, no mostrar gastos
      query = query.in('unidad_id', [])
    }
  }

  const { data: gastos = [] } = await query

  // Verificar permisos
  const canCreate = ['administrador', 'tesorero', 'superadmin'].includes(perfil.rol)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary-600" />
              Gastos Comunes
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-0.5">
              Gestión de gastos comunes según Art. 22-27 Ley 21.442
            </p>
          </div>
        </div>
      </div>

      {/* Información legal */}
      <div className="card bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p className="font-medium">Marco legal Ley 21.442:</p>
            <p>
              • <strong>Art. 22</strong>: Los gastos comunes deben ser proporcionales al coeficiente de
              participación
            </p>
            <p>
              • <strong>Art. 23</strong>: El condominio debe entregar estados de cuenta semestrales
            </p>
            <p>
              • <strong>Art. 25</strong>: Plazo máximo 30 días para pago (Art. 25)
            </p>
            <p>
              • <strong>Art. 27</strong>: Aplica interés de mora según tasa corriente de CMF
            </p>
          </div>
        </div>
      </div>

      {/* Cliente interactivo */}
      <GastosClient
        gastos={gastos as GastoComun[]}
        periodo={periodo}
        canCreate={canCreate}
        userRole={perfil.rol}
      />
    </div>
  )
}
