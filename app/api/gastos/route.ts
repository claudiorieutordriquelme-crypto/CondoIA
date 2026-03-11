import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CreateGastoSchema = z.object({
  periodo: z.string().regex(/^\d{4}-\d{2}$/),
  unidad_id: z.string().uuid().optional(),
  generar_todos: z.boolean().default(false),
  monto_base: z.number().positive(),
  monto_extra: z.number().min(0).default(0),
  fecha_vencimiento: z.string(),
  notas: z.string().max(500).optional(),
})

// GET: Listar gastos del período
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol, condominio_id')
    .eq('id', user.id)
    .single()

  const { searchParams } = new URL(req.url)
  const periodo = searchParams.get('periodo') ?? new Date().toISOString().slice(0, 7)

  const query = supabase
    .from('gastos_comunes')
    .select('*, unidades(numero, tipo, piso)')
    .eq('condominio_id', perfil?.condominio_id!)
    .eq('periodo', periodo)
    .order('creado_en', { ascending: false })

  // Copropietarios solo ven sus propios gastos
  if (perfil?.rol === 'copropietario' || perfil?.rol === 'arrendatario') {
    const { data: misUnidades } = await supabase
      .from('unidades')
      .select('id')
      .eq('condominio_id', perfil.condominio_id!)
      .or(`propietario_id.eq.${user.id},arrendatario_id.eq.${user.id}`)

    if (misUnidades && misUnidades.length > 0) {
      query.in('unidad_id', misUnidades.map((u) => u.id))
    }
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ gastos: data })
}

// POST: Crear gastos (individual o masivo)
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol, condominio_id')
    .eq('id', user.id)
    .single()

  if (!['administrador', 'tesorero', 'superadmin'].includes(perfil?.rol ?? '')) {
    return NextResponse.json({ error: 'Sin permisos para crear gastos' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = CreateGastoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
  }

  const { periodo, generar_todos, unidad_id, monto_base, monto_extra, fecha_vencimiento, notas } = parsed.data

  if (generar_todos) {
    // Generar gastos para todas las unidades del condominio
    const { data: unidades } = await supabase
      .from('unidades')
      .select('id, coeficiente')
      .eq('condominio_id', perfil!.condominio_id!)
      .eq('activo', true)

    if (!unidades || unidades.length === 0) {
      return NextResponse.json({ error: 'No hay unidades activas' }, { status: 400 })
    }

    // Verificar que no existan ya gastos para este período
    const { count } = await supabase
      .from('gastos_comunes')
      .select('*', { count: 'exact', head: true })
      .eq('condominio_id', perfil!.condominio_id!)
      .eq('periodo', periodo)

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: `Ya existen gastos emitidos para el período ${periodo}` },
        { status: 409 }
      )
    }

    const gastosToCreate = unidades.map((u) => ({
      condominio_id: perfil!.condominio_id!,
      unidad_id: u.id,
      periodo,
      monto_base,
      monto_extra: monto_extra * (u.coeficiente ?? 1),
      monto_total: monto_base + (monto_extra * (u.coeficiente ?? 1)),
      fecha_vencimiento,
      estado: 'pendiente',
      notas,
      generado_por_ia: false,
    }))

    const { data: created, error } = await supabase
      .from('gastos_comunes')
      .insert(gastosToCreate)
      .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ gastos: created, count: created?.length }, { status: 201 })
  } else {
    // Gasto individual
    if (!unidad_id) {
      return NextResponse.json({ error: 'Se requiere unidad_id para gasto individual' }, { status: 400 })
    }

    const { data: created, error } = await supabase
      .from('gastos_comunes')
      .insert({
        condominio_id: perfil!.condominio_id!,
        unidad_id,
        periodo,
        monto_base,
        monto_extra,
        monto_total: monto_base + monto_extra,
        fecha_vencimiento,
        estado: 'pendiente',
        notas,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ gasto: created }, { status: 201 })
  }
}

// PATCH: Actualizar estado de pago
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json()
  const { id, estado, metodo_pago, comprobante_url } = body

  if (!id || !estado) {
    return NextResponse.json({ error: 'Se requiere id y estado' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('gastos_comunes')
    .update({
      estado,
      ...(estado === 'pagado' && {
        fecha_pago: new Date().toISOString(),
        metodo_pago,
        comprobante_url,
      }),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ gasto: data })
}
