/**
 * CondoIA — Agente Administrador Virtual
 *
 * Fundamento legal: Ley 21.442 de Copropiedad Inmobiliaria (Chile)
 * Art. 36-47: Atribuciones y obligaciones del administrador
 *
 * IMPORTANTE: Este agente actúa como asistente del administrador humano
 * certificado, que es quien ostenta la personalidad jurídica legal.
 * Los documentos generados por este agente requieren revisión y firma
 * del administrador certificado registrado en la plataforma.
 */

import Anthropic from '@anthropic-ai/sdk'
import type { AnthropicMessage } from '@/types'

const SYSTEM_PROMPT = `Eres el Agente Administrador Virtual de CondoIA.

## Tu identidad y rol legal

Actúas como asistente de inteligencia artificial del administrador certificado del condominio, en el marco de la **Ley 21.442 de Copropiedad Inmobiliaria de Chile** y su Reglamento (publicado enero 2025).

El administrador humano certificado es quien posee la representación legal de la comunidad. Tú eres su apoyo inteligente para cumplir sus obligaciones de forma eficiente, transparente y dentro de la ley.

## Tus atribuciones (Art. 36-47 Ley 21.442)

1. **Gestión administrativa**: Redactar citaciones, circulares, cartas de cobranza y comunicaciones oficiales de la comunidad.
2. **Cumplimiento normativo**: Velar por el cumplimiento del reglamento y de la Ley 21.442.
3. **Representación en trámites**: Asesorar sobre trámites ante organismos públicos, SII, tribunales.
4. **Convocatoria de asambleas**: Preparar la convocatoria, agenda y documentos para asambleas ordinarias y extraordinarias (Art. 17).
5. **Certificados de deuda**: Generar borradores de certificados de deuda electrónicos (Art. 27).
6. **Mantención del condominio**: Coordinar solicitudes de mantención, priorizar por urgencia.
7. **Custodia de documentos**: Organizar el repositorio documental de la comunidad.

## Lo que puedes hacer

- Redactar documentos oficiales: citaciones, actas, certificados, contratos con proveedores, cartas de cobranza
- Responder consultas legales sobre la Ley 21.442, reglamento interno y derechos/obligaciones
- Analizar situación financiera de la comunidad y proponer acciones correctivas
- Generar reportes narrativos de la gestión administrativa
- Calcular quórum requerido según tipo de asamblea (Art. 18)
- Asesorar sobre procedimientos de cobranza extrajudicial y judicial (Art. 28)
- Explicar los derechos y deberes de copropietarios (Art. 10-15)
- Ayudar a redactar modificaciones al reglamento de copropiedad

## Tus límites

- No puedes tomar decisiones que requieran la aprobación de la asamblea de copropietarios
- No puedes firmar documentos — eso corresponde al administrador humano certificado
- No puedes realizar pagos ni transferencias bancarias
- Siempre aclara cuando una decisión requiere votación en asamblea

## Formato de respuesta

- Responde siempre en español formal pero cercano
- Cuando redactes documentos oficiales, usa formato legal chileno apropiado
- Incluye referencias a artículos específicos de la Ley 21.442 cuando sea relevante
- Si generas un documento, indica claramente "BORRADOR — requiere revisión y firma del administrador certificado"
- Para temas de cobranza, menciona siempre los plazos y el derecho a defensa del deudor

## Datos del condominio en contexto

Cuando el usuario comparta datos del condominio, úsalos para personalizar tus respuestas.`

export class AgenteAdministrador {
  private client: Anthropic
  private model = 'claude-opus-4-6'

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })
  }

  /**
   * Genera una respuesta del agente administrador.
   * @param messages - Historial de mensajes de la conversación
   * @param condominioContext - Datos del condominio para contextualizar
   */
  async responder(
    messages: AnthropicMessage[],
    condominioContext?: {
      nombre: string
      total_unidades: number
      unidades_morosas?: number
      administrador_nombre?: string
    }
  ): Promise<string> {
    const systemWithContext = condominioContext
      ? `${SYSTEM_PROMPT}\n\n## Contexto del condominio actual\n- **Nombre**: ${condominioContext.nombre}\n- **Total unidades**: ${condominioContext.total_unidades}\n- **Unidades morosas**: ${condominioContext.unidades_morosas ?? 'N/D'}\n- **Administrador certificado**: ${condominioContext.administrador_nombre ?? 'Por completar'}`
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
      throw new Error('No se recibió respuesta de texto del agente')
    }

    return textContent.text
  }

  /**
   * Genera un certificado de deuda (Art. 27 Ley 21.442)
   */
  async generarCertificadoDeuda(datos: {
    nombre_propietario: string
    rut_propietario: string
    numero_unidad: string
    monto_deuda: number
    periodos_adeudados: string[]
    nombre_condominio: string
    administrador_nombre: string
  }): Promise<string> {
    const prompt = `Redacta un Certificado de Deuda oficial según el Art. 27 de la Ley 21.442 de Copropiedad Inmobiliaria para:

- Propietario: ${datos.nombre_propietario} (RUT: ${datos.rut_propietario})
- Unidad: ${datos.numero_unidad}
- Deuda total: $${datos.monto_deuda.toLocaleString('es-CL')} CLP
- Períodos adeudados: ${datos.periodos_adeudados.join(', ')}
- Condominio: ${datos.nombre_condominio}
- Administrador: ${datos.administrador_nombre}
- Fecha: ${new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}

El documento debe incluir: encabezado oficial, identificación del condominio, datos del deudor, detalle de la deuda período a período, monto total, base legal, espacio para firma del administrador y sello. Marca como BORRADOR.`

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = response.content.find((c) => c.type === 'text')
    return textContent?.type === 'text' ? textContent.text : ''
  }

  /**
   * Genera citación a asamblea (Art. 17 Ley 21.442)
   */
  async generarCitacionAsamblea(datos: {
    tipo: 'ordinaria' | 'extraordinaria'
    fecha_primera: string
    fecha_segunda: string
    sala_virtual?: string
    puntos_tabla: string[]
    nombre_condominio: string
    administrador_nombre: string
  }): Promise<string> {
    const prompt = `Redacta una citación formal a Asamblea ${datos.tipo === 'ordinaria' ? 'Ordinaria' : 'Extraordinaria'} según el Art. 17 de la Ley 21.442 para:

- Condominio: ${datos.nombre_condominio}
- Primera citación: ${datos.fecha_primera}
- Segunda citación (Art. 18 — 30 min después): ${datos.fecha_segunda}
- Modalidad: ${datos.sala_virtual ? `Virtual — ${datos.sala_virtual}` : 'Presencial'}
- Puntos de tabla: ${datos.puntos_tabla.map((p, i) => `${i + 1}. ${p}`).join(', ')}
- Administrador: ${datos.administrador_nombre}

Incluye: encabezado, referencia legal, fecha de citación (mínimo 5 días hábiles antes per Ley 21.442), quórum requerido según tipo de asamblea, todos los puntos de la tabla, y nota sobre participación virtual. Marca como BORRADOR.`

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = response.content.find((c) => c.type === 'text')
    return textContent?.type === 'text' ? textContent.text : ''
  }
}
