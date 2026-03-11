import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AgenteTesorero } from '@/lib/agents/tesorero'
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol, condominio_id')
      .eq('id', user.id)
      .single()

    if (!perfil || !['administrador', 'tesorero', 'superadmin'].includes(perfil.rol)) {
      return NextResponse.json(
        { error: 'No tienes permiso para usar el Agente Tesorero' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    // Obtener contexto financiero del mes actual
    const periodoActual = new Date().toISOString().slice(0, 7)
    const { data: gastos } = await supabase
      .from('gastos_comunes')
      .select('estado, monto_total')
      .eq('condominio_id', perfil.condominio_id!)
      .eq('periodo', periodoActual)

    const financialContext = gastos
      ? {
          recaudacion_mes: gastos.filter((g) => g.estado === 'pagado').reduce((s, g) => s + g.monto_total, 0),
          gastos_mes: gastos.reduce((s, g) => s + g.monto_total, 0),
          tasa_pago: gastos.length > 0 ? Math.round((gastos.filter((g) => g.estado === 'pagado').length / gastos.length) * 100) : 0,
          unidades_morosas: gastos.filter((g) => g.estado === 'vencido' || g.estado === 'en_cobranza').length,
          fondo_reserva: 0, // Obtener del presupuesto
        }
      : undefined

    const agente = new AgenteTesorero()
    const respuesta = await agente.responder(parsed.data.messages, financialContext)

    const ultimoMensaje = parsed.data.messages[parsed.data.messages.length - 1]
    await supabase.from('chat_agentes').insert([
      { condominio_id: perfil.condominio_id, perfil_id: user.id, agente: 'tesorero', rol: 'user', contenido: ultimoMensaje.content },
      { condominio_id: perfil.condominio_id, perfil_id: user.id, agente: 'tesorero', rol: 'assistant', contenido: respuesta },
    ])

    return NextResponse.json({ response: respuesta })
  } catch (error) {
    console.error('[Agent/Tesorero] Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
