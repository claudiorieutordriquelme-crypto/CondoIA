'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserPlus, Settings, Loader2, Check, AlertCircle, BarChart3 } from 'lucide-react'
import type { Perfil } from '@/types'

interface AdminClientProps {
  usuarios: Perfil[]
  perfil: Perfil
}

const ROLES = [
  { value: 'superadmin', label: 'Superadministrador' },
  { value: 'administrador', label: 'Administrador' },
  { value: 'tesorero', label: 'Tesorero' },
  { value: 'secretario', label: 'Secretario' },
  { value: 'copropietario', label: 'Copropietario' },
  { value: 'arrendatario', label: 'Arrendatario' },
]

export default function AdminClient({ usuarios, perfil }: AdminClientProps) {
  const supabase = createClient()

  // Invite form state
  const [email, setEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState('copropietario')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteMessage, setInviteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Role change state
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Filter out superadmin users
  const isUserSuperAdmin = perfil.rol === 'superadmin'
  const displayedUsuarios = isUserSuperAdmin ? usuarios : usuarios.filter((u) => u.rol !== 'superadmin')

  async function handleInviteUser(e: React.FormEvent) {
    e.preventDefault()
    setInviteLoading(true)
    setInviteMessage(null)

    try {
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: {
          rol: selectedRole,
          condominio_id: perfil.condominio_id,
        },
      })

      if (error) {
        setInviteMessage({
          type: 'error',
          text: 'Error al enviar la invitación. Verifica el correo e intenta nuevamente.',
        })
        return
      }

      setInviteMessage({
        type: 'success',
        text: `Invitación enviada a ${email}. Se creará una cuenta con rol ${ROLES.find((r) => r.value === selectedRole)?.label}`,
      })
      setEmail('')
      setSelectedRole('copropietario')
    } catch (err) {
      setInviteMessage({
        type: 'error',
        text: 'Ocurrió un error. Intenta nuevamente.',
      })
    } finally {
      setInviteLoading(false)
    }
  }

  async function handleChangeRole(userId: string, newRole: string) {
    setUpdatingUserId(userId)
    setUpdateMessage(null)

    try {
      const { error } = await supabase
        .from('perfiles')
        .update({ rol: newRole })
        .eq('id', userId)

      if (error) {
        setUpdateMessage({
          type: 'error',
          text: 'Error al actualizar el rol. Intenta nuevamente.',
        })
        return
      }

      setUpdateMessage({
        type: 'success',
        text: 'Rol actualizado correctamente',
      })
    } catch (err) {
      setUpdateMessage({
        type: 'error',
        text: 'Ocurrió un error. Intenta nuevamente.',
      })
    } finally {
      setUpdatingUserId(null)
      setTimeout(() => setUpdateMessage(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Invite User Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Invitar usuario</h2>
        </div>

        <form onSubmit={handleInviteUser} className="space-y-4">
          {inviteMessage && (
            <div
              role="alert"
              className={`rounded-lg border p-3 text-sm flex items-start gap-2 ${
                inviteMessage.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
              }`}
            >
              {inviteMessage.type === 'success' ? (
                <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              )}
              <span>{inviteMessage.text}</span>
            </div>
          )}

          <div>
            <label htmlFor="invite-email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Correo electrónico
            </label>
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@correo.cl"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="invite-role" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Rol
            </label>
            <select
              id="invite-role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="input"
            >
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={inviteLoading} className="btn-primary w-full">
            {inviteLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando invitación...
              </>
            ) : (
              'Enviar invitación'
            )}
          </button>
        </form>
      </div>

      {/* User Management Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Gestión de usuarios ({displayedUsuarios.length})
          </h2>
        </div>

        {updateMessage && (
          <div
            role="alert"
            className={`rounded-lg border p-3 text-sm flex items-start gap-2 mb-4 ${
              updateMessage.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            }`}
          >
            {updateMessage.type === 'success' ? (
              <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            )}
            <span>{updateMessage.text}</span>
          </div>
        )}

        {displayedUsuarios.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-600 dark:text-neutral-400">No hay usuarios en este condominio</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                    Nombre
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                    RUT
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                    Rol
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-4 py-3">{usuario.nombre_completo}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{usuario.email}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{usuario.rut}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          usuario.rol === 'superadmin' || usuario.rol === 'administrador'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : usuario.rol === 'tesorero' || usuario.rol === 'secretario'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}
                      >
                        {ROLES.find((r) => r.value === usuario.rol)?.label || usuario.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={usuario.rol}
                        onChange={(e) => handleChangeRole(usuario.id, e.target.value)}
                        disabled={updatingUserId === usuario.id || (!isUserSuperAdmin && usuario.rol === 'administrador')}
                        className="input text-xs py-1.5 px-2"
                      >
                        {ROLES.filter((r) => isUserSuperAdmin || r.value !== 'superadmin').map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Información del sistema</h2>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Total de usuarios administrados:</span>
            <span className="font-semibold text-neutral-900 dark:text-white">{displayedUsuarios.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Tu rol:</span>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {ROLES.find((r) => r.value === perfil.rol)?.label || perfil.rol}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Última actualización:</span>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {new Date().toLocaleDateString('es-CL', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
