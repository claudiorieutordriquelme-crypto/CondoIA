'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Send, Loader2, Shield, TrendingUp, FileText, Download } from 'lucide-react'
import type { AgenteTipo, MensajeChat } from '@/types'
import { cn } from '@/lib/utils'

const AGENTES = [
  {
    id: 'administrador' as AgenteTipo,
    nombre: 'Agente Administrador',
    subtitulo: 'Art. 36-47 Ley 21.442',
    descripcion: 'Gestión administrativa, certificados, citaciones y cobranza',
    icon: <Shield className="h-5 w-5" />,
    color: 'primary',
    sugerencias: [
      '¿Cómo redacto una citación a asamblea ordinaria?',
      'Genera un certificado de deuda para la unidad 304',
      '¿Cuáles son mis obligaciones como administrador según la Ley 21.442?',
      '¿Cómo inicio un proceso de cobranza extrajudicial?',
    ],
  },
  {
    id: 'tesorero' as AgenteTipo,
    nombre: 'Agente Tesorero',
    subtitulo: 'Art. 22-35 Ley 21.442',
    descripcion: 'Finanzas, presupuesto, morosidad e informes',
    icon: <TrendingUp className="h-5 w-5" />,
    color: 'green',
    sugerencias: [
      'Analiza la situación financiera del condominio',
      '¿Cómo calculo el fondo de reserva adecuado?',
      'Genera un informe financiero del mes',
      '¿Qué hacer con las unidades con 3+ meses de mora?',
    ],
  },
  {
    id: 'secretario' as AgenteTipo,
    nombre: 'Agente Secretario',
    subtitulo: 'Art. 17-21 Ley 21.442',
    descripcion: 'Actas, comunicados, votaciones y documentos',
    icon: <FileText className="h-5 w-5" />,
    color: 'purple',
    sugerencias: [
      'Redacta un comunicado sobre corte de agua',
      '¿Qué debe incluir un acta de asamblea según la ley?',
      'Genera una circular sobre nuevas reglas del condominio',
      'Crea un poder de delegación de voto para asamblea',
    ],
  },
]

function AgentesContent() {
  const searchParams = useSearchParams()
  const agenteParam = searchParams.get('agente') as AgenteTipo | null

  const [agenteSeleccionado, setAgenteSeleccionado] = useState<AgenteTipo>(
    agenteParam ?? 'administrador'
  )
  const [mensajes, setMensajes] = useState<MensajeChat[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const agente = AGENTES.find((a) => a.id === agenteSeleccionado)!

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  // Limpiar chat al cambiar de agente
  useEffect(() => {
    setMensajes([])
    setError(null)
  }, [agenteSeleccionado])

  async function handleEnviar() {
    if (!input.trim() || loading) return

    const userMessage: MensajeChat = {
      id: crypto.randomUUID(),
      agente: agenteSeleccionado,
      rol: 'user',
      contenido: input.trim(),
      creado_en: new Date().toISOString(),
    }

    setMensajes((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const response = await fetch(`/api/agents/${agenteSeleccionado}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...mensajes, userMessage].map((m) => ({
            role: m.rol,
            content: m.contenido,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      const assistantMessage: MensajeChat = {
        id: crypto.randomUUID(),
        agente: agenteSeleccionado,
        rol: 'assistant',
        contenido: data.response,
        creado_en: new Date().toISOString(),
      }

      setMensajes((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con el agente')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEnviar()
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    // Auto-resize
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  function handleDownload() {
    const texto = mensajes
      .map((m) => `[${m.rol.toUpperCase()}] ${m.contenido}`)
      .join('\n\n---\n\n')
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversacion-${agente.nombre.toLowerCase().replace(/ /g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Agentes IA</h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-0.5">
            Asistentes especializados en la Ley 21.442 de Copropiedad Inmobiliaria
          </p>
        </div>
        {mensajes.length > 0 && (
          <button onClick={handleDownload} className="btn-secondary text-sm gap-1.5">
            <Download className="h-4 w-4" />
            Descargar
          </button>
        )}
      </div>

      {/* Selector de agentes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {AGENTES.map((a) => (
          <button
            key={a.id}
            onClick={() => setAgenteSeleccionado(a.id)}
            className={cn(
              'card text-left transition-all p-4',
              'hover:border-primary-300 dark:hover:border-primary-700',
              agenteSeleccionado === a.id
                ? 'ring-2 ring-primary-500 border-primary-300 dark:border-primary-700'
                : ''
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-primary-600">{a.icon}</span>
              <span className="font-semibold text-sm text-neutral-900 dark:text-white">{a.nombre}</span>
            </div>
            <p className="text-xs text-neutral-500">{a.subtitulo}</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{a.descripcion}</p>
          </button>
        ))}
      </div>

      {/* Chat */}
      <div className="flex-1 card flex flex-col min-h-0" style={{ minHeight: '400px' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mensajes.length === 0 && (
            <div className="text-center py-8">
              <div className="text-primary-600 mb-3 flex justify-center">{agente.icon}</div>
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">{agente.nombre}</h3>
              <p className="text-sm text-neutral-500 mb-6">{agente.descripcion}</p>
              <div className="grid sm:grid-cols-2 gap-2 text-left max-w-xl mx-auto">
                {agente.sugerencias.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-sm p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/10 text-neutral-600 dark:text-neutral-400 text-left transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mensajes.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex',
                msg.rol === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div className={msg.rol === 'user' ? 'chat-user' : 'chat-assistant'}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.contenido}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="chat-assistant flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                <span className="text-sm text-neutral-500">El agente está pensando...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-neutral-200 dark:border-neutral-700 p-4">
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={`Pregunta al ${agente.nombre}... (Enter para enviar, Shift+Enter para nueva línea)`}
              className="input flex-1 resize-none min-h-[44px] max-h-[120px] py-2.5"
              rows={1}
              disabled={loading}
              aria-label="Mensaje al agente"
            />
            <button
              onClick={handleEnviar}
              disabled={!input.trim() || loading}
              className="btn-primary min-h-[44px] min-w-[44px] p-2.5"
              aria-label="Enviar mensaje"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            Los documentos generados son borradores. Requieren revisión y firma del responsable legal.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AgentesPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-96 bg-neutral-100 rounded-xl" />}>
      <AgentesContent />
    </Suspense>
  )
}
