'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2, LayoutDashboard, DollarSign, Users, CalendarDays,
  FileText, MessageSquare, Wrench, Store, Settings, ChevronLeft,
  ShieldCheck, BookOpen, X
} from 'lucide-react'
import type { Perfil, UserRole } from '@/types'
import { cn } from '@/lib/utils'

interface SidebarProps {
  perfil: (Perfil & { condominios?: { nombre: string } | null }) | null
}

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  roles: UserRole[]
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Resumen',
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ['superadmin', 'administrador', 'tesorero', 'secretario', 'copropietario', 'arrendatario'],
  },
  {
    href: '/dashboard/gastos',
    label: 'Gastos Comunes',
    icon: <DollarSign className="h-5 w-5" />,
    roles: ['superadmin', 'administrador', 'tesorero', 'secretario', 'copropietario', 'arrendatario'],
  },
  {
    href: '/dashboard/asambleas',
    label: 'Asambleas',
    icon: <CalendarDays className="h-5 w-5" />,
    roles: ['superadmin', 'administrador', 'tesorero', 'secretario', 'copropietario'],
  },
  {
    href: '/dashboard/copropietarios',
    label: 'Copropietarios',
    icon: <Users className="h-5 w-5" />,
    roles: ['superadmin', 'administrador', 'secretario'],
  },
  {
    href: '/dashboard/documentos',
    label: 'Documentos',
    icon: <FileText className="h-5 w-5" />,
    roles: ['superadmin', 'administrador', 'tesorero', 'secretario', 'copropietario'],
  },
  {
    href: '/dashboard/mantenimiento',
    label: 'Mantención',
    icon: <Wrench className="h-5 w-5" />,
    roles: ['superadmin', 'administrador', 'secretario', 'copropietario', 'arrendatario'],
  },
  {
    href: '/dashboard/agentes',
    label: 'Agentes IA',
    icon: <MessageSquare className="h-5 w-5" />,
    roles: ['superadmin', 'administrador', 'tesorero', 'secretario'],
    badge: 'IA',
  },
  {
    href: '/dashboard/proveedores',
    label: 'Proveedores',
    icon: <Store className="h-5 w-5" />,
    roles: ['superadmin', 'administrador'],
  },
  {
    href: '/dashboard/reglamento',
    label: 'Ley 21.442',
    icon: <BookOpen className="h-5 w-5" />,
    roles: ['superadmin', 'administrador', 'tesorero', 'secretario', 'copropietario'],
  },
  {
    href: '/dashboard/admin',
    label: 'Administración',
    icon: <ShieldCheck className="h-5 w-5" />,
    roles: ['superadmin', 'administrador'],
  },
]

export default function Sidebar({ perfil }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const rol = perfil?.rol ?? 'copropietario'
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(rol))

  return (
    <>
      {/* Sidebar desktop */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-neutral-200 dark:border-neutral-800',
          'bg-white dark:bg-neutral-900 transition-all duration-200',
          collapsed ? 'w-16' : 'w-64'
        )}
        aria-label="Navegación principal"
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center border-b border-neutral-200 dark:border-neutral-800 px-4',
          'h-16 flex-shrink-0',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary-600 flex-shrink-0" />
              <span className="font-bold text-neutral-900 dark:text-white">CondoIA</span>
            </Link>
          )}
          {collapsed && <Building2 className="h-6 w-6 text-primary-600" />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100',
              'dark:hover:text-neutral-300 dark:hover:bg-neutral-800',
              collapsed && 'hidden'
            )}
            aria-label="Colapsar menú"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Condominio info */}
        {!collapsed && perfil?.condominios && (
          <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Condominio</p>
            <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
              {perfil.condominios.nombre}
            </p>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-0.5 px-2">
            {visibleItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                      'transition-colors duration-100 min-h-[44px]',
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Settings */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-2">
          <Link
            href="/dashboard/configuracion"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
              'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
              'dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200',
              'min-h-[44px]',
              collapsed && 'justify-center px-2'
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Configuración</span>}
          </Link>
        </div>
      </aside>
    </>
  )
}
