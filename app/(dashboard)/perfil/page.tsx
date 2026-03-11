import { createClient } from '@/lib/supabase/server'
import { User, Mail, Phone, FileText, MapPin, Building2 } from 'lucide-react'
import { PerfilForm } from '@/components/perfil/PerfilForm'
import type { Perfil, Condominio } from '@/types'

export const metadata = { title: 'Mi Perfil' }

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: condominio } = await supabase
    .from('condominios')
    .select('*')
    .eq('id', perfil?.condominio_id)
    .single()

  const rolLabel: Record<string, string> = {
    superadmin: 'Súper Administrador',
    administrador: 'Administrador',
    tesorero: 'Tesorero',
    secretario: 'Secretario',
    copropietario: 'Copropietario',
    arrendatario: 'Arrendatario',
  }

  const temaLabel: Record<string, string> = {
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Automático (Sistema)',
  }

  const userPerfil = perfil as Perfil
  const userCondominio = condominio as Condominio

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Mi Perfil</h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-0.5">
          Información personal y preferencias de cuenta
        </p>
      </div>

      {/* Tarjeta de Perfil */}
      <div className="card space-y-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
            <User className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              {userPerfil.nombre_completo}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
              {rolLabel[userPerfil.rol]}
              {userPerfil.es_administrador_certificado && (
                <span className="ml-2 inline-block px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-medium">
                  Certificado
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          {/* Email */}
          <div>
            <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              Correo electrónico
            </p>
            <p className="text-sm font-medium text-neutral-900 dark:text-white break-all">{user!.email}</p>
          </div>

          {/* Teléfono */}
          <div>
            <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              Teléfono
            </p>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {userPerfil.telefono || '—'}
            </p>
          </div>

          {/* RUT */}
          <div>
            <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              RUT
            </p>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {userPerfil.rut || '—'}
            </p>
          </div>

          {/* Unidad */}
          <div>
            <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              Unidad
            </p>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {userPerfil.numero_unidad || '—'}
            </p>
          </div>

          {/* Condominio */}
          <div className="sm:col-span-2">
            <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              Condominio
            </p>
            <div className="text-sm font-medium text-neutral-900 dark:text-white">
              <p>{userCondominio.nombre}</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {userCondominio.direccion} • {userCondominio.comuna}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de Edición */}
      <PerfilForm perfil={userPerfil} />

      {/* Preferencias */}
      <div className="space-y-4">
        {/* Tema */}
        <div className="card">
          <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Preferencias de Interfaz</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-neutral-700 dark:text-neutral-300 mb-2 block">Tema</label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {temaLabel[userPerfil.tema]}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Puedes cambiar el tema desde el menú de tu cuenta (esquina superior derecha)
              </p>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="card">
          <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Notificaciones</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">Notificaciones por Email</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Recibe alertas de asambleas, gastos vencidos y circulares
                </p>
              </div>
              <div className="h-5 w-9 rounded-full transition-colors flex items-center px-0.5"
                style={{ backgroundColor: userPerfil.notificaciones_email ? '#3b82f6' : '#d1d5db' }}>
                <div
                  className="h-4 w-4 rounded-full bg-white transition-transform"
                  style={{ transform: userPerfil.notificaciones_email ? 'translateX(18px)' : 'none' }}
                />
              </div>
            </div>
            <p className="text-xs text-neutral-500">
              Estado actual: {userPerfil.notificaciones_email ? 'Habilitadas' : 'Deshabilitadas'}
            </p>
          </div>
        </div>

        {/* Seguridad */}
        <div className="card">
          <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Seguridad</h3>
          <button className="btn-secondary text-sm">
            Cambiar contraseña
          </button>
          <p className="text-xs text-neutral-500 mt-2">
            Se abrirá una ventana para cambiar tu contraseña de forma segura
          </p>
        </div>
      </div>
    </div>
  )
}
