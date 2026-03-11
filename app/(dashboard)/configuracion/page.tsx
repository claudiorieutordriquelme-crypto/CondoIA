import { createClient } from '@/lib/supabase/server'
import { Settings, Building2, DollarSign, Shield, Zap, Bell } from 'lucide-react'
import { ConfigForm } from '@/components/configuracion/ConfigForm'
import type { Condominio, Perfil } from '@/types'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Configuración' }

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol, condominio_id')
    .eq('id', user!.id)
    .single()

  // Solo admin y superadmin pueden acceder
  if (!['administrador', 'superadmin'].includes(perfil?.rol ?? '')) {
    redirect('/dashboard')
  }

  const { data: condominio } = await supabase
    .from('condominios')
    .select('*')
    .eq('id', perfil?.condominio_id)
    .single()

  const userCondominio = condominio as Condominio

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Configuración</h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-0.5">
            Configuración del condominio y preferencias del sistema
          </p>
        </div>
      </div>

      {/* Aviso de Permisos */}
      {perfil?.rol === 'administrador' && (
        <div className="card bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium">Acceso limitado</p>
              <p className="text-xs mt-0.5">
                Tienes acceso como Administrador. Algunos parámetros requieren permisos de Súper Administrador.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sección 1: Datos del Condominio */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Datos del Condominio</h2>
        </div>
        <ConfigForm
          section="condominio"
          condominio={userCondominio}
          isSuperAdmin={perfil?.rol === 'superadmin'}
        />
      </div>

      {/* Sección 2: Gastos Comunes */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Configuración de Gastos Comunes</h2>
        </div>
        <ConfigForm
          section="gastos"
          condominio={userCondominio}
          isSuperAdmin={perfil?.rol === 'superadmin'}
        />
      </div>

      {/* Sección 3: Administrador Certificado */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Administrador Certificado</h2>
        </div>
        <div className="card">
          <p className="text-xs text-neutral-500 mb-4">
            Información del administrador certificado del condominio (Ley 21.442, Art. 36-47)
          </p>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-neutral-500 mb-1">Nombre</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {userCondominio.administrador_nombre || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">RUT</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {userCondominio.administrador_rut || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Vigencia del Certificado</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {userCondominio.administrador_vigencia
                  ? new Date(userCondominio.administrador_vigencia).toLocaleDateString('es-CL')
                  : '—'}
              </p>
            </div>
          </div>
        </div>
        <ConfigForm
          section="administrador"
          condominio={userCondominio}
          isSuperAdmin={perfil?.rol === 'superadmin'}
        />
      </div>

      {/* Sección 4: Agentes IA */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Agentes IA</h2>
        </div>
        <ConfigForm
          section="agentes"
          condominio={userCondominio}
          isSuperAdmin={perfil?.rol === 'superadmin'}
        />
      </div>

      {/* Sección 5: Notificaciones */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Notificaciones</h2>
        </div>
        <ConfigForm
          section="notificaciones"
          condominio={userCondominio}
          isSuperAdmin={perfil?.rol === 'superadmin'}
        />
      </div>
    </div>
  )
}
