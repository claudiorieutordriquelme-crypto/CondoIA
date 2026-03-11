'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

// ============================================================
// GastosChart — Gráfico evolutivo Ingresos vs Egresos
// Diseño multi-generacional: colores de alto contraste,
// tooltips grandes, tipografía legible, touch-friendly
// ============================================================

interface MonthData {
  mes: string
  mesCorto: string
  ingresos: number
  egresos: number
}

interface GastosChartProps {
  /** Data externa opcional. Si no se pasa, usa datos demo */
  data?: MonthData[]
}

const DEMO_DATA: MonthData[] = [
  { mes: 'Octubre',    mesCorto: 'Oct', ingresos: 3850000, egresos: 3420000 },
  { mes: 'Noviembre',  mesCorto: 'Nov', ingresos: 4100000, egresos: 3680000 },
  { mes: 'Diciembre',  mesCorto: 'Dic', ingresos: 4350000, egresos: 4950000 },
  { mes: 'Enero',      mesCorto: 'Ene', ingresos: 3920000, egresos: 3510000 },
  { mes: 'Febrero',    mesCorto: 'Feb', ingresos: 4200000, egresos: 3750000 },
  { mes: 'Marzo',      mesCorto: 'Mar', ingresos: 4176000, egresos: 3890000 },
]

function formatCLP(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `$${Math.round(n / 1000)}K`
  return `$${n}`
}

function formatCLPFull(n: number): string {
  return '$' + n.toLocaleString('es-CL')
}

export default function GastosChart({ data }: GastosChartProps) {
  const months = data || DEMO_DATA
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'barras' | 'area'>('barras')

  const maxValue = Math.max(...months.flatMap((m) => [m.ingresos, m.egresos])) * 1.15
  const chartHeight = 220
  const barWidth = 28
  const groupGap = 12

  // Totales para resumen
  const totalIngresos = months.reduce((s, m) => s + m.ingresos, 0)
  const totalEgresos = months.reduce((s, m) => s + m.egresos, 0)
  const balance = totalIngresos - totalEgresos
  const tendencia = months.length >= 2
    ? months[months.length - 1].ingresos - months[months.length - 1].egresos
    : 0

  // Escalas para gráfico de área
  const areaWidth = 600
  const areaXStep = areaWidth / (months.length - 1 || 1)

  function toY(value: number): number {
    return chartHeight - (value / maxValue) * chartHeight
  }

  function buildPath(key: 'ingresos' | 'egresos'): string {
    return months
      .map((m, i) => `${i === 0 ? 'M' : 'L'}${i * areaXStep},${toY(m[key])}`)
      .join(' ')
  }

  function buildAreaPath(key: 'ingresos' | 'egresos'): string {
    const line = buildPath(key)
    const lastX = (months.length - 1) * areaXStep
    return `${line} L${lastX},${chartHeight} L0,${chartHeight} Z`
  }

  return (
    <div className="card space-y-4">
      {/* Header con toggle de vista */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary-600" />
          <h3 className="font-semibold text-neutral-900 dark:text-white text-base">
            Evolución Financiera
          </h3>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Últimos 6 meses
          </span>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => setViewMode('barras')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors touch-manipulation ${
              viewMode === 'barras'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
            }`}
            style={{ minHeight: '36px' }}
          >
            Barras
          </button>
          <button
            onClick={() => setViewMode('area')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors touch-manipulation ${
              viewMode === 'area'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
            }`}
            style={{ minHeight: '36px' }}
          >
            Tendencia
          </button>
        </div>
      </div>

      {/* Resumen KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 dark:bg-green-900/15 rounded-xl px-4 py-3 border border-green-100 dark:border-green-900/30">
          <p className="text-xs text-green-700 dark:text-green-400 font-medium">Total Ingresos</p>
          <p className="text-lg font-bold text-green-800 dark:text-green-300 mt-0.5">
            {formatCLP(totalIngresos)}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/15 rounded-xl px-4 py-3 border border-red-100 dark:border-red-900/30">
          <p className="text-xs text-red-700 dark:text-red-400 font-medium">Total Egresos</p>
          <p className="text-lg font-bold text-red-800 dark:text-red-300 mt-0.5">
            {formatCLP(totalEgresos)}
          </p>
        </div>
        <div className={`rounded-xl px-4 py-3 border ${
          balance >= 0
            ? 'bg-blue-50 dark:bg-blue-900/15 border-blue-100 dark:border-blue-900/30'
            : 'bg-amber-50 dark:bg-amber-900/15 border-amber-100 dark:border-amber-900/30'
        }`}>
          <p className={`text-xs font-medium ${
            balance >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-amber-700 dark:text-amber-400'
          }`}>
            Balance
          </p>
          <p className={`text-lg font-bold mt-0.5 flex items-center gap-1 ${
            balance >= 0 ? 'text-blue-800 dark:text-blue-300' : 'text-amber-800 dark:text-amber-300'
          }`}>
            {balance >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {formatCLP(Math.abs(balance))}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="relative">
        {/* Tooltip flotante */}
        {hoveredIndex !== null && (
          <div
            className="absolute z-20 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900
              rounded-xl px-4 py-3 shadow-lg pointer-events-none transition-all duration-150"
            style={{
              left: `${Math.min(
                Math.max(
                  viewMode === 'barras'
                    ? (hoveredIndex * (barWidth * 2 + groupGap + 40)) + 60
                    : (hoveredIndex * areaXStep / areaWidth) * 100 * 5.5 + 60,
                  20
                ),
                450
              )}px`,
              top: '-8px',
            }}
          >
            <p className="font-semibold text-sm mb-1">{months[hoveredIndex].mes}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              Ingresos: <span className="font-bold">{formatCLPFull(months[hoveredIndex].ingresos)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
              Egresos: <span className="font-bold">{formatCLPFull(months[hoveredIndex].egresos)}</span>
            </div>
            <div className="text-xs mt-1 opacity-75">
              Saldo: {formatCLPFull(months[hoveredIndex].ingresos - months[hoveredIndex].egresos)}
            </div>
          </div>
        )}

        {viewMode === 'barras' ? (
          /* ===== VISTA BARRAS ===== */
          <div className="overflow-x-auto">
            <svg
              width={Math.max(months.length * (barWidth * 2 + groupGap + 40) + 80, 500)}
              height={chartHeight + 60}
              className="w-full"
              viewBox={`0 0 ${Math.max(months.length * (barWidth * 2 + groupGap + 40) + 80, 500)} ${chartHeight + 60}`}
              role="img"
              aria-label="Gráfico de barras: Ingresos vs Egresos por mes"
            >
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                <g key={pct}>
                  <line
                    x1="55" x2="100%"
                    y1={chartHeight - pct * chartHeight + 10}
                    y2={chartHeight - pct * chartHeight + 10}
                    stroke="currentColor"
                    className="text-neutral-200 dark:text-neutral-700"
                    strokeDasharray={pct === 0 ? '' : '4 4'}
                    strokeWidth="1"
                  />
                  <text
                    x="50" y={chartHeight - pct * chartHeight + 14}
                    textAnchor="end"
                    className="fill-neutral-400 dark:fill-neutral-500"
                    fontSize="11"
                    fontFamily="inherit"
                  >
                    {formatCLP(pct * maxValue)}
                  </text>
                </g>
              ))}

              {/* Barras por mes */}
              {months.map((m, i) => {
                const groupX = 70 + i * (barWidth * 2 + groupGap + 40)
                const ingH = (m.ingresos / maxValue) * chartHeight
                const egrH = (m.egresos / maxValue) * chartHeight
                const isHovered = hoveredIndex === i

                return (
                  <g
                    key={i}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onTouchStart={() => setHoveredIndex(i)}
                    className="cursor-pointer"
                    role="group"
                    aria-label={`${m.mes}: Ingresos ${formatCLPFull(m.ingresos)}, Egresos ${formatCLPFull(m.egresos)}`}
                  >
                    {/* Hover background */}
                    <rect
                      x={groupX - 8}
                      y={10}
                      width={barWidth * 2 + groupGap + 16}
                      height={chartHeight}
                      rx="6"
                      className={`transition-opacity duration-150 ${
                        isHovered ? 'fill-neutral-100/50 dark:fill-neutral-700/30' : 'fill-transparent'
                      }`}
                    />

                    {/* Barra ingresos */}
                    <rect
                      x={groupX}
                      y={chartHeight + 10 - ingH}
                      width={barWidth}
                      height={ingH}
                      rx="4"
                      className={`transition-all duration-200 ${
                        isHovered ? 'fill-emerald-400' : 'fill-emerald-500'
                      }`}
                      style={{
                        filter: isHovered ? 'brightness(1.15)' : undefined,
                      }}
                    />

                    {/* Barra egresos */}
                    <rect
                      x={groupX + barWidth + groupGap}
                      y={chartHeight + 10 - egrH}
                      width={barWidth}
                      height={egrH}
                      rx="4"
                      className={`transition-all duration-200 ${
                        isHovered ? 'fill-rose-400' : 'fill-rose-500'
                      }`}
                      style={{
                        filter: isHovered ? 'brightness(1.15)' : undefined,
                      }}
                    />

                    {/* Label del mes */}
                    <text
                      x={groupX + barWidth + groupGap / 2}
                      y={chartHeight + 30}
                      textAnchor="middle"
                      className={`transition-colors duration-150 ${
                        isHovered
                          ? 'fill-neutral-900 dark:fill-white font-semibold'
                          : 'fill-neutral-500 dark:fill-neutral-400'
                      }`}
                      fontSize="13"
                      fontFamily="inherit"
                    >
                      {m.mesCorto}
                    </text>

                    {/* Valores encima de barras (solo si hover) */}
                    {isHovered && (
                      <>
                        <text
                          x={groupX + barWidth / 2}
                          y={chartHeight + 10 - ingH - 6}
                          textAnchor="middle"
                          className="fill-emerald-600 dark:fill-emerald-400"
                          fontSize="10"
                          fontWeight="600"
                        >
                          {formatCLP(m.ingresos)}
                        </text>
                        <text
                          x={groupX + barWidth + groupGap + barWidth / 2}
                          y={chartHeight + 10 - egrH - 6}
                          textAnchor="middle"
                          className="fill-rose-600 dark:fill-rose-400"
                          fontSize="10"
                          fontWeight="600"
                        >
                          {formatCLP(m.egresos)}
                        </text>
                      </>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>
        ) : (
          /* ===== VISTA ÁREA / TENDENCIA ===== */
          <div className="overflow-x-auto">
            <svg
              width={areaWidth + 80}
              height={chartHeight + 60}
              className="w-full"
              viewBox={`0 0 ${areaWidth + 80} ${chartHeight + 60}`}
              role="img"
              aria-label="Gráfico de tendencia: Ingresos vs Egresos"
            >
              <defs>
                <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="gradEgresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              <g transform="translate(65, 10)">
                {/* Grid */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                  <g key={pct}>
                    <line
                      x1="0" x2={areaWidth}
                      y1={chartHeight - pct * chartHeight}
                      y2={chartHeight - pct * chartHeight}
                      stroke="currentColor"
                      className="text-neutral-200 dark:text-neutral-700"
                      strokeDasharray={pct === 0 ? '' : '4 4'}
                      strokeWidth="1"
                    />
                    <text
                      x="-8" y={chartHeight - pct * chartHeight + 4}
                      textAnchor="end"
                      className="fill-neutral-400 dark:fill-neutral-500"
                      fontSize="11"
                    >
                      {formatCLP(pct * maxValue)}
                    </text>
                  </g>
                ))}

                {/* Área ingresos */}
                <path d={buildAreaPath('ingresos')} fill="url(#gradIngresos)" />
                {/* Línea ingresos */}
                <path d={buildPath('ingresos')} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

                {/* Área egresos */}
                <path d={buildAreaPath('egresos')} fill="url(#gradEgresos)" />
                {/* Línea egresos */}
                <path d={buildPath('egresos')} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

                {/* Puntos interactivos + labels */}
                {months.map((m, i) => {
                  const x = i * areaXStep
                  const isHovered = hoveredIndex === i
                  return (
                    <g
                      key={i}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onTouchStart={() => setHoveredIndex(i)}
                      className="cursor-pointer"
                    >
                      {/* Línea vertical al hover */}
                      {isHovered && (
                        <line
                          x1={x} x2={x}
                          y1={0} y2={chartHeight}
                          stroke="currentColor"
                          className="text-neutral-300 dark:text-neutral-600"
                          strokeDasharray="4 4"
                        />
                      )}

                      {/* Hit area invisible */}
                      <rect x={x - 20} y={0} width={40} height={chartHeight + 30} fill="transparent" />

                      {/* Punto ingresos */}
                      <circle
                        cx={x} cy={toY(m.ingresos)}
                        r={isHovered ? 6 : 4}
                        className="fill-emerald-500 transition-all duration-150"
                        stroke="white" strokeWidth="2"
                      />
                      {/* Punto egresos */}
                      <circle
                        cx={x} cy={toY(m.egresos)}
                        r={isHovered ? 6 : 4}
                        className="fill-rose-500 transition-all duration-150"
                        stroke="white" strokeWidth="2"
                      />

                      {/* Label mes */}
                      <text
                        x={x} y={chartHeight + 20}
                        textAnchor="middle"
                        className={`transition-colors ${
                          isHovered
                            ? 'fill-neutral-900 dark:fill-white font-semibold'
                            : 'fill-neutral-500 dark:fill-neutral-400'
                        }`}
                        fontSize="13"
                      >
                        {m.mesCorto}
                      </text>
                    </g>
                  )
                })}
              </g>
            </svg>
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-6 pt-1">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Ingresos (recaudación)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Egresos (gastos operacionales)</span>
        </div>
      </div>

      {/* Insight IA */}
      {tendencia > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl px-4 py-3 flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-emerald-800 dark:text-emerald-300">
            <span className="font-semibold">Balance positivo este mes.</span>{' '}
            Los ingresos superan a los egresos por {formatCLPFull(tendencia)}. La recaudación se mantiene estable.
          </div>
        </div>
      )}
      {tendencia <= 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl px-4 py-3 flex items-start gap-3">
          <TrendingDown className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Atención:</span>{' '}
            Los egresos superan a los ingresos por {formatCLPFull(Math.abs(tendencia))}. Considere revisar los gastos operacionales.
          </div>
        </div>
      )}
    </div>
  )
}
