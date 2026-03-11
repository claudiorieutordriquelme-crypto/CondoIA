import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileText, AlertCircle } from 'lucide-react'
import { DocumentosClient } from '@/components/documentos/DocumentosClient'
import type { Documento } from '@/types'

export const metadata = {
  title: 'Documentos | CondoIA',
  description: 'Repositorio de documentos del condominio'
}

export default async function DocumentosPage() {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get user profile and condominio info
  const { data: perfil, error: perfilError } = await supabase
    .from('perfiles')
    .select('*, condominios(*)')
    .eq('usuario_id', user.id)
    .single()

  if (perfilError || !perfil) {
    redirect('/login')
  }

  // Get all documents for the condominio
  const { data: documentos = [], error: documentosError } = await supabase
    .from('documentos')
    .select('*')
    .eq('condominio_id', perfil.condominio_id)
    .order('creado_en', { ascending: false })

  // Check if user is admin or secretario (can upload)
  const canUpload = ['admin', 'secretario'].includes(perfil.rol)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
            <FileText className="w-10 h-10 text-blue-400" />
            Documentos
          </h1>
          <p className="text-slate-400 text-lg">
            Repositorio centralizado de actas, reglamentos, contratos y correspondencia del condominio
          </p>
        </div>

        {/* Ley 19.799 Banner */}
        <div className="card bg-blue-900/20 border border-blue-500/30 mb-6 p-4 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <p className="text-blue-200 text-sm">
              <strong>Ley 19.799:</strong> Los documentos firmados digitalmente en esta plataforma cumplen con los requisitos de firma electrónica según la legislación chilena vigente.
            </p>
          </div>
        </div>

        {/* Client Component - handles search, filters, and upload */}
        <DocumentosClient
          documentos={documentos || []}
          canUpload={canUpload}
          condominioId={perfil.condominio_id}
          userRole={perfil.rol}
        />
      </div>
    </main>
  )
}
