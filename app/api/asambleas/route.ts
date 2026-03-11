import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CreateAsambleaSchema = z.object({
  tipo: z.enum(['ordinaria', 'extraordinaria', 'de_emergencia']),
  titulo: z.string().min(5).max(200),
  descripcion: z.string().max(1000).optional(),
  fecha_convocatoria: z.string().datetime(),
  sala_virtual_url: z.string().url().optional(),
  quorum_requerido: z.number().min(0).max(100).optional(),
  puntos_tabla: z.array(z.string()).min(1),
})

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('condominio_id')
    .eq('id', user.id)
    .single()

  const { data, error } = await supabase
    .from('asambleas')
    .select('*, votaciones(count)')
    .eq('condominio_id', perfil?.condominio_id!)
    .order('fecha_convocatoria', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ asambleas: data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol, condominio_id')
    .eq('id', user.id)
    .single()

  if (!['administrador', 'secretario', 'superadmin'].includes(perfil?.rol ?? '')) {
    return NextResponse.json({ error: 'Sin permisos para crear asambleas' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = CreateAsambleaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
  }

  const fechaConvocatoria = new Date(parsed.data.fecha_convocatoria)

  // Verificar que la convocatoria sea al menos 5 días hábiles (Ley 21.442)
  const ahora = new Date()
  const diasDiferencia = Math.floor((fechaConvocatoria.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24))

  // Calcular segunda citación (30 minutos después, Art. 18)
  const fechaSegundaCitacion = new Date(fechaConvocatoria.getTime() + 30 * 60 * 1000)

  // Quórum según tipo (Art. 18)
  const quorumPorTipo: Record<string, number> = {
    ordinaria: 50,
    extraordinaria: 50,
    de_emergencia: 33,
  }

  const { data, error } = await supabase
    .from('asambleas')
    .insert({
      condominio_id: perfil!.condominio_id!,
      tipo: parsed.data.tipo,
      estado: 'convocada',
      titulo: parsed.data.titulo,
      descripcion: `${parsed.data.descripcion ?? ''}\n\nPUNTOS DE TABLA:\n${parsed.data.puntos_tabla.map((p, i) => `${i + 1}. ${p}`).join('\n')}`,
      fecha_convocatoria: fechaConvocatoria.toISOString(),
      fecha_primera_citacion: fechaConvocatoria.toISOString(),
      fecha_segunda_citacion: fechaSegundaCitacion.toISOString(),
      sala_virtual_url: parsed.data.sala_virtual_url,
      quorum_requerido: parsed.data.quorum_requerido ?? quorumPorTipo[parsed.data.tipo],
      creado_por: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Advertir si no cumple los 5 días hábiles
  const advertencias: string[] = []
  if (diasDiferencia < 5) {
    advertencias.push(`⚠️ La convocatoria es en ${diasDiferencia} días. La Ley 21.442 requiere mínimo 5 días hábiles de anticipación.`)
  }

  return NextResponse.json({
    asamblea: data,
    advertencias,
  }, { status: 201 })
}
