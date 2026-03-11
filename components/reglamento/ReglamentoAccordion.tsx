'use client'

import { useState } from 'react'
import { ChevronDown, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Articulo {
  numero: string
  titulo: string
  resumen: string
  condoiaHelp?: boolean
}

interface Seccion {
  id: string
  titulo: string
  articulos: Articulo[]
  icon: React.ReactNode
  color: string
}

interface ReglamentoAccordionProps {
  seccion: Seccion
}

export function ReglamentoAccordion({ seccion }: ReglamentoAccordionProps) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className="card overflow-hidden transition-all">
      {/* Header - Click para abrir/cerrar */}
      <button
        onClick={() => setAbierto(!abierto)}
        className={cn(
          'w-full px-6 py-4 flex items-center gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors text-left'
        )}
      >
        {/* Icon */}
        <div className={`flex-shrink-0 ${seccion.color}`}>{seccion.icon}</div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 dark:text-white">{seccion.titulo}</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {seccion.articulos.length} artículos •{' '}
            {seccion.articulos.filter((a) => a.condoiaHelp).length} automatizados en CondoIA
          </p>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={cn(
            'h-5 w-5 text-neutral-400 flex-shrink-0 transition-transform',
            abierto && 'rotate-180'
          )}
        />
      </button>

      {/* Contenido desplegable */}
      {abierto && (
        <div className="border-t border-neutral-200 dark:border-neutral-700 px-6 py-4 space-y-3">
          {seccion.articulos.map((articulo) => (
            <div
              key={articulo.numero}
              className="pb-3 last:pb-0 last:border-b-0 border-b border-neutral-100 dark:border-neutral-800"
            >
              {/* Número y título del artículo */}
              <div className="flex items-start gap-3 mb-2">
                <div className="min-w-fit">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-medium">
                    Art. {articulo.numero}
                  </span>
                </div>
                <h4 className="font-medium text-neutral-900 dark:text-white text-sm">{articulo.titulo}</h4>
              </div>

              {/* Resumen */}
              <p className="text-sm text-neutral-600 dark:text-neutral-400 ml-16">{articulo.resumen}</p>

              {/* Badge de CondoIA */}
              {articulo.condoiaHelp && (
                <div className="flex items-center gap-1.5 mt-2 ml-16 text-xs text-green-700 dark:text-green-300">
                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>CondoIA automatiza este requisito</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
