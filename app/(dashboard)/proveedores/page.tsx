import { createClient } from '@/lib/supabase/server'
import { Plus, Star } from 'lucide-react'
import Link from 'next/link'
import { ProveedoresClient } from '@/components/proveedores/ProveedoresClient'
import type { Proveedor } from '@/types'

export const metadata = { title: 'Proveedores Verificados' }

export default async function ProveedoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol, condominio_id')
    .eq('id', user!.id)
    .single()

  const { data: proveedores } = await supabase
    .from('proveedores')
    .select('*')
    .eq('condominio_id', perfil?.condominio_id!)
    .eq('verificado', true)
    .order('calificacion_promedio', { ascending: false })
    .limit(100)

  const esAdmin = perfil?.rol === 'administrador' || perfil?.rol === 'superadmin'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Proveedores Verificados</h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-0.5">
            Directorio de proveedores de servicios y mantenimiento
          </p>
        </div>
        {esAdmin && (
          <Link href="/dashboard/proveedores/nuevo" className="btn-primary">
            <Plus className="h-4 w-4" />
            Agregar proveedor
          </Link>
        )}
      </div>

      {/* Client Component with search and grid */}
      <ProveedoresClient proveedores={proveedores as Proveedor[]} />
    </div>
  )
}
