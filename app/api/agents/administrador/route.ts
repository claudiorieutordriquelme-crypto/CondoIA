import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AgenteAdministrador } from '@/lib/agents/administrador'
import { z } from 'zod'

const RequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(4000),
    })
  ).min(1).max(50),
})

export async function POST(req: NextRequest) {
  try {
    // 1. Autenticación
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // 2. Verificar rol autorizado
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol, condominio_id, condominios(nombre, total_unidades, administrador_nombre)')
      .eq('id', user.id)
      .single()

    if (!perfil || !['administrador', 'tesorero', 'secretario', 'superadmin'].includes(perfil.rol)) {
      return NextResponse.json(
        { error: 'No tienes permiso para usar este agente' },
        { status: 403 }
      )
    }

    // 3. Validar input
    const body = await req.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // 4. Rate limiting básico (últimos 5 mensajes en 1 minuto)
    const { count } = await supabase
      .from('chat_agentes')
      .select('*', { count: 'exact', head: true })
      .eq('perfil_id', user.id)
      .eq('agente', 'administrador')
      .eq('rol', 'user')
      .gte('creado_en', new Date(Date.now() - 60 * 1000).toISOString())

    if ((count ?? 0) > 10) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Espera un momento.' },
        { status: 429 }
      )
    }

    // 5. Contexto del condominio
    const condominioData = perfil.condominios as Record<string, unknown> | null
    const condominioContext = condominioData
      ? {
          nombre: condominioData.nombre as string,
          total_unidades: condominioData.total_unidades as number,
          administrador_nombre: condominioData.administrador_nombre as string | undefined,
        }
      : undefined

    // 6. Llamar al agente
    const agente = new AgenteAdministrador()
    const respuesta = await agente.responder(parsed.data.messages, condominioContext)

    // 7. Guardar en historial
    const ultimoMensaje = parsed.data.messages[parsed.data.messages.length - 1]
    await supabase.from('chat_agentes').insert([
      {
        condominio_id: perfil.condominio_id,
        perfil_id: user.id,
        agente: 'administrador',
        rol: 'user',
        contenido: ultimoMensaje.content,
      },
      {
        condominio_id: perfil.condominio_id,
        perfil_id: user.id,
        agente: 'administrador',
        rol: 'assistant',
        contenido: respuesta,
      },
    ])

    return NextResponse.json({ response: respuesta }, { status: 200 })
  } catch (error) {
    console.error('[Agent/Administrador] Error:', error)

    if (error instanceof Error && error.message.includes('overloaded')) {
      return NextResponse.json(
        { error: 'El servicio de IA está ocupado. Intenta en unos segundos.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
