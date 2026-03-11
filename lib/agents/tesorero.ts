/**
 * CondoIA — Agente Tesorero Virtual
 *
 * Fundamento legal: Ley 21.442 de Copropiedad Inmobiliaria (Chile)
 * Art. 22-35: Gestión financiera y contable del condominio
 * Art. 25: Presupuesto anual
 * Art. 27: Certificados de deuda
 * Art. 28: Procedimientos de cobranza
 */

import Anthropic from '@anthropic-ai/sdk'
import type { AnthropicMessage } from '@/types'

const SYSTEM_PROMPT = `Eres el Agente Tesorero Virtual de CondoIA.

## Tu identidad y rol

Actúas como asistente especializado en finanzas y contabilidad del condominio, en el marco de la **Ley 21.442 de Copropiedad Inmobiliaria de Chile**.

El tesorero humano del comité de administración es quien ostenta la responsabilidad legal. Tú eres su apoyo inteligente para mantener las finanzas del condominio ordenadas, transparentes y en cumplimiento de la ley.

## Tus responsabilidades (Art. 22-35 Ley 21.442)

1. **Gastos comunes**: Calcular, emitir y hacer seguimiento de gastos comunes mensuales
2. **Presupuesto anual**: Preparar y analizar el presupuesto según Art. 25
3. **Fondo de reserva**: Gestionar y reportar el fondo de reserva obligatorio
4. **Morosidad**: Monitorear y generar alertas de morosidad, calcular intereses según Ley
5. **Reportes financieros**: Generar estados de resultados, flujos de caja, balances
6. **Transparencia**: Garantizar acceso de copropietarios a información financiera
7. **Conciliación bancaria**: Verificar concordancia entre ingresos y pagos

## Lo que puedes hacer

- Calcular gastos comunes proporcionales según coeficiente de copropiedad
- Analizar estado de morosidad y calcular intereses aplicables (Art. 27)
- Proyectar gastos a 6 y 12 meses con escenarios
- Detectar anomalías en ingresos/egresos y alertar
- Generar reportes financieros narrativos (no solo tablas — explicaciones)
- Comparar gastos con benchmarks del mercado para condominios similares
- Asesorar sobre recuperación de deudas y procedimiento de cobranza judicial
- Preparar información financiera para la asamblea anual (Art. 25)
- Calcular el monto de fondo de reserva adecuado según el tipo de condominio
- Explicar cada línea del presupuesto de forma comprensible para copropietarios

## Límites

- No puedes realizar pagos, transferencias ni acceder a cuentas bancarias
- No puedes firmar documentos financieros — eso corresponde al tesorero y administrador
- Los reportes que generes son borradores que requieren validación humana

## Comunicación financiera

Usa un lenguaje claro y sin jerga financiera cuando hables con copropietarios.
Cuando hables con el tesorero o administrador, puedes usar términos técnicos apropiados.
Siempre incluye el impacto práctico de los números: "esto significa que cada unidad pagará X más al mes".

## Formato de respuesta

- Incluye números formateados en pesos chilenos (CLP) con punto como separador de miles
- Usa porcentajes para comparaciones (tasa de pago, distribución de gastos)
- Para reportes complejos, usa tablas Markdown
- Siempre incluye un "resumen ejecutivo" de 2-3 líneas antes del detalle
- Referencia artículos específicos de la Ley 21.442 cuando aplique`

export class AgenteTesorero {
  private client: Anthropic
  private model = 'claude-opus-4-6'

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })
  }

  async responder(
    messages: AnthropicMessage[],
    financialContext?: {
      recaudacion_mes: number
      gastos_mes: number
      tasa_pago: number
      unidades_morosas: number
      fondo_reserva: number
    }
  ): Promise<string> {
    const systemWithContext = financialContext
      ? `${SYSTEM_PROMPT}\n\n## Contexto financiero actual\n- **Recaudación este mes**: $${financialContext.recaudacion_mes.toLocaleString('es-CL')} CLP\n- **Gastos este mes**: $${financialContext.gastos_mes.toLocaleString('es-CL')} CLP\n- **Tasa de pago**: ${financialContext.tasa_pago}%\n- **Unidades morosas**: ${financialContext.unidades_morosas}\n- **Fondo de reserva**: $${financialContext.fondo_reserva.toLocaleString('es-CL')} CLP`
      : SYSTEM_PROMPT

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      system: systemWithContext,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const textContent = response.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No se recibió respuesta del agente tesorero')
    }

    return textContent.text
  }

  /**
   * Genera informe financiero mensual narrativo
   */
  async generarInformeMensual(datos: {
    mes: string
    nombre_condominio: string
    total_unidades: number
    unidades_pagadas: number
    monto_recaudado: number
    monto_esperado: number
    principales_gastos: Array<{ concepto: string; monto: number }>
    saldo_fondo_reserva: number
    unidades_morosas: Array<{ numero: string; monto: number; meses: number }>
  }): Promise<string> {
    const tasaPago = Math.round((datos.unidades_pagadas / datos.total_unidades) * 100)

    const prompt = `Genera un Informe Financiero Mensual completo y comprensible para el mes de ${datos.mes} del ${datos.nombre_condominio}:

**Datos del período:**
- Total unidades: ${datos.total_unidades}
- Unidades al día: ${datos.unidades_pagadas} (${tasaPago}% de cumplimiento)
- Monto recaudado: $${datos.monto_recaudado.toLocaleString('es-CL')} CLP
- Monto esperado: $${datos.monto_esperado.toLocaleString('es-CL')} CLP
- Déficit/Superávit: $${(datos.monto_recaudado - datos.monto_esperado).toLocaleString('es-CL')} CLP
- Principales gastos: ${datos.principales_gastos.map((g) => `${g.concepto}: $${g.monto.toLocaleString('es-CL')}`).join(', ')}
- Fondo de reserva acumulado: $${datos.saldo_fondo_reserva.toLocaleString('es-CL')} CLP
- Unidades morosas: ${datos.unidades_morosas.length}

El informe debe incluir: resumen ejecutivo, análisis de recaudación, estado de morosidad con recomendaciones, análisis de gastos, situación del fondo de reserva y recomendaciones para el próximo mes. Usa lenguaje claro y accesible para copropietarios.`

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = response.content.find((c) => c.type === 'text')
    return textContent?.type === 'text' ? textContent.text : ''
  }

  /**
   * Analiza y clasifica automáticamente un gasto
   */
  async clasificarGasto(descripcion: string, monto: number): Promise<{
    categoria: string
    subcategoria: string
    es_recurrente: boolean
    afecta_presupuesto: boolean
    sugerencia: string
  }> {
    const prompt = `Clasifica este gasto del condominio:
Descripción: "${descripcion}"
Monto: $${monto.toLocaleString('es-CL')} CLP

Responde en JSON con: categoria, subcategoria, es_recurrente (boolean), afecta_presupuesto (boolean), sugerencia (texto breve).`

    const response = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001', // Modelo más rápido para clasificaciones simples
      max_tokens: 300,
      system: 'Eres un clasificador de gastos de condominios. Responde SOLO con JSON válido.',
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = response.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('Error al clasificar gasto')
    }

    try {
      return JSON.parse(textContent.text)
    } catch {
      return {
        categoria: 'General',
        subcategoria: 'Sin clasificar',
        es_recurrente: false,
        afecta_presupuesto: true,
        sugerencia: 'Clasificar manualmente',
      }
    }
  }
}
