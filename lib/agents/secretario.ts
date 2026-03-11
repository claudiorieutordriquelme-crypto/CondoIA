/**
 * CondoIA — Agente Secretario Virtual
 *
 * Fundamento legal: Ley 21.442 de Copropiedad Inmobiliaria (Chile)
 * Art. 17-21: Gestión de asambleas
 * Art. 19: Actas de asamblea y su validez
 * Art. 20: Firma y registro de actas
 */

import Anthropic from '@anthropic-ai/sdk'
import type { AnthropicMessage } from '@/types'

const SYSTEM_PROMPT = `Eres el Agente Secretario Virtual de CondoIA.

## Tu identidad y rol

Actúas como asistente especializado en gestión documental y secretaría del condominio, en el marco de la **Ley 21.442 de Copropiedad Inmobiliaria de Chile**.

El secretario humano del comité de administración es quien ostenta la responsabilidad legal de las actas y documentos. Tú eres su apoyo inteligente para que toda la documentación sea precisa, completa y legalmente válida.

## Tus responsabilidades (Art. 17-21 Ley 21.442)

1. **Gestión de actas**: Redactar actas de asamblea con transcripción de lo acordado (Art. 19)
2. **Libro de registros**: Mantener actualizado el libro de actas y registros de la comunidad
3. **Notificaciones**: Redactar y gestionar notificaciones con validez legal
4. **Comunicaciones**: Preparar comunicados y circulares para copropietarios
5. **Archivo documental**: Organizar y catalogar el repositorio de documentos
6. **Votaciones**: Registrar resultados de votaciones con trazabilidad
7. **Delegaciones de voto**: Gestionar poderes de representación para asambleas

## Lo que puedes hacer

- Transcribir y resumir grabaciones/notas de asambleas en actas formales
- Redactar actas de asamblea con formato legal chileno (Art. 19)
- Generar comunicados y circulares para la comunidad
- Crear plantillas de documentos (poderes, contratos, notificaciones)
- Mantener el índice documental del condominio
- Registrar y certificar resultados de votaciones
- Recordar fechas límite legales (convocatorias, plazos de impugnación)
- Redactar la memoria anual de actividades del condominio
- Traducir documentos legales complejos a lenguaje comprensible

## Validez legal de documentos (Art. 19-20 Ley 21.442)

El acta de asamblea tiene validez legal cuando:
1. Es firmada por el presidente y secretario de la asamblea
2. Se registra en el libro de actas (físico o digital) dentro de 15 días hábiles
3. Indica claramente los acuerdos adoptados y los quórum obtenidos
4. Se notifica a los copropietarios ausentes dentro del plazo legal

Bajo la Ley 19.799 de Firma Electrónica de Chile, los documentos con firma electrónica simple del administrador tienen validez equivalente al documento en papel.

## Comunicación

Adapta el tono según el destinatario:
- Para documentos oficiales: lenguaje formal y técnico-legal
- Para comunicados a copropietarios: lenguaje claro, amable y directo
- Para el comité de administración: profesional pero práctico

## Formato de respuesta

- Para actas: formato legal chileno estándar con encabezado, numeración y firmas
- Para comunicados: formato carta oficial con membrete
- Para respuestas de chat: conversacional y directo
- Indica siempre "BORRADOR — requiere revisión y firma del secretario del comité"
- Incluye referencias legales relevantes de la Ley 21.442`

export class AgenteSecretario {
  private client: Anthropic
  private model = 'claude-opus-4-6'

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })
  }

  async responder(
    messages: AnthropicMessage[],
    documentContext?: {
      tipo_documento?: string
      nombre_condominio?: string
    }
  ): Promise<string> {
    const systemWithContext = documentContext
      ? `${SYSTEM_PROMPT}\n\n## Contexto\n- **Condominio**: ${documentContext.nombre_condominio ?? 'Por definir'}\n- **Tipo de documento a trabajar**: ${documentContext.tipo_documento ?? 'General'}`
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
      throw new Error('No se recibió respuesta del agente secretario')
    }

    return textContent.text
  }

  /**
   * Genera acta de asamblea a partir de notas o transcripción (Art. 19 Ley 21.442)
   */
  async generarActaAsamblea(datos: {
    tipo: 'ordinaria' | 'extraordinaria'
    fecha: string
    nombre_condominio: string
    asistentes_count: number
    total_unidades: number
    quorum_porcentaje: number
    presidente_asamblea: string
    secretario_asamblea: string
    puntos_tratados: Array<{
      numero: number
      titulo: string
      descripcion: string
      resultado?: string
      votos_favor?: number
      votos_contra?: number
    }>
    acuerdos: string[]
    observaciones?: string
  }): Promise<string> {
    const prompt = `Redacta un Acta de Asamblea ${datos.tipo === 'ordinaria' ? 'Ordinaria' : 'Extraordinaria'} conforme al Art. 19 de la Ley 21.442:

**Información general:**
- Fecha: ${datos.fecha}
- Condominio: ${datos.nombre_condominio}
- Asistentes: ${datos.asistentes_count} de ${datos.total_unidades} unidades (${datos.quorum_porcentaje}% de quórum)
- Presidente de la asamblea: ${datos.presidente_asamblea}
- Secretario de la asamblea: ${datos.secretario_asamblea}

**Puntos de la tabla tratados:**
${datos.puntos_tratados.map((p) => `${p.numero}. ${p.titulo}: ${p.descripcion}${p.resultado ? ` — Resultado: ${p.resultado} (${p.votos_favor ?? 0} a favor, ${p.votos_contra ?? 0} en contra)` : ''}`).join('\n')}

**Acuerdos adoptados:**
${datos.acuerdos.map((a, i) => `${i + 1}. ${a}`).join('\n')}

${datos.observaciones ? `**Observaciones:** ${datos.observaciones}` : ''}

Redacta el acta en formato legal chileno estándar con todos los elementos requeridos por la Ley 21.442: encabezado oficial, verificación de quórum, desarrollo de cada punto, votaciones si las hubo, acuerdos y sección de firmas. Marca como BORRADOR.`

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = response.content.find((c) => c.type === 'text')
    return textContent?.type === 'text' ? textContent.text : ''
  }

  /**
   * Redacta comunicado para copropietarios
   */
  async generarComunicado(datos: {
    tipo: 'informativo' | 'urgente' | 'convocatoria' | 'cobranza'
    asunto: string
    contenido: string
    nombre_condominio: string
    firmante: string
  }): Promise<string> {
    const urgencia =
      datos.tipo === 'urgente'
        ? 'MUY URGENTE — '
        : datos.tipo === 'convocatoria'
          ? 'CONVOCATORIA — '
          : datos.tipo === 'cobranza'
            ? 'AVISO DE COBRANZA — '
            : ''

    const prompt = `Redacta un comunicado ${urgencia}para los copropietarios del ${datos.nombre_condominio}:

Asunto: ${datos.asunto}
Tipo: ${datos.tipo}
Contenido principal: ${datos.contenido}
Firmante: ${datos.firmante}
Fecha: ${new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}

Usa un tono apropiado al tipo de comunicado. Para cobranza, incluye los derechos del copropietario y las vías de pago disponibles. Formato carta oficial con membrete. Marca como BORRADOR.`

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = response.content.find((c) => c.type === 'text')
    return textContent?.type === 'text' ? textContent.text : ''
  }

  /**
   * Transcribe y resume reuniones usando IA
   */
  async resumirReunion(transcripcion: string, nombre_condominio: string): Promise<{
    resumen: string
    acuerdos: string[]
    tareas_pendientes: string[]
    proximos_pasos: string[]
  }> {
    const prompt = `Analiza esta transcripción de reunión del ${nombre_condominio} y extrae la información clave:

TRANSCRIPCIÓN:
${transcripcion}

Responde en JSON con: resumen (string), acuerdos (array de strings), tareas_pendientes (array), proximos_pasos (array).`

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1500,
      system: 'Eres un asistente que analiza reuniones de condominios. Responde SOLO con JSON válido.',
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = response.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('Error al resumir reunión')
    }

    try {
      return JSON.parse(textContent.text)
    } catch {
      return {
        resumen: textContent.text,
        acuerdos: [],
        tareas_pendientes: [],
        proximos_pasos: [],
      }
    }
  }
}
