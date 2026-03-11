import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*, condominios(*)')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
      {/* Sidebar navegación */}
      <Sidebar perfil={perfil} />

      {/* Contenido principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar perfil={perfil} />
        <main
          id="main-content"
          role="main"
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
