'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, User, LogOut, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Perfil } from '@/types'
import { cn } from '@/lib/utils'

const ROL_LABELS: Record<string, string> = {
  superadmin: 'Superadmin',
  administrador: 'Administrador',
  tesorero: 'Tesorero',
  secretario: 'Secretario',
  copropietario: 'Copropietario',
  arrendatario: 'Arrendatario',
}

interface TopbarProps {
  perfil: Perfil | null
}

export default function Topbar({ perfil }: TopbarProps) {
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-shrink-0">
      {/* Título de página - se podría pasar como prop */}
      <div className="flex items-center gap-2">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 bg-primary-600 text-white px-4 py-2 rounded">
          Ir al contenido principal
        </a>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Notificaciones */}
        <button
          className="relative p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Ver notificaciones"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" aria-hidden="true" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors min-h-[44px]"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-primary-600" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-neutral-900 dark:text-white leading-tight truncate max-w-32">
                {perfil?.nombre_completo ?? 'Usuario'}
              </p>
              <p className="text-xs text-neutral-500 leading-tight">
                {ROL_LABELS[perfil?.rol ?? 'copropietario']}
              </p>
            </div>
            <ChevronDown className={cn('h-4 w-4 text-neutral-400 transition-transform', menuOpen && 'rotate-180')} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-elevated z-20 py-1">
                <a
                  href="/dashboard/perfil"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 min-h-[44px]"
                >
                  <User className="h-4 w-4" />
                  Mi perfil
                </a>
                <hr className="my-1 border-neutral-100 dark:border-neutral-700" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 min-h-[44px]"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
