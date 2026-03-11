import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AgenteSecretario } from '@/lib/agents/secretario'
import { z } from 'zod'

const RequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(4000),
    })
  ).min(1).max(50),
  tipo_documento: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol, condominio_id, condominios(nombre)')
      .eq('id', user.id)
      .single()

    if (!perfil || !['administrador', 'secretario', 'superadmin'].includes(perfil.rol)) {
      return NextResponse.json(
        { error: 'No tienes permiso para usar el Agente Secretario' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const condominioData = perfil.condominios as Record<string, unknown> | null
    const agente = new AgenteSecretario()
    const respuesta = await agente.responder(parsed.data.messages, {
      tipo_documento: parsed.data.tipo_documento,
      nombre_condominio: condominioData?.nombre as string | undefined,
    })

    const ultimoMensaje = parsed.data.messages[parsed.data.messages.length - 1]
    await supabase.from('chat_agentes').insert([
      { condominio_id: perfil.condominio_id, perfil_id: user.id, agente: 'secretario', rol: 'user', contenido: ultimoMensaje.content },
      { condominio_id: perfil.condominio_id, perfil_id: user.id, agente: 'secretario', rol: 'assistant', contenido: respuesta },
    ])

    return NextResponse.json({ response: respuesta })
  } catch (error) {
    console.error('[Agent/Secretario] Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
