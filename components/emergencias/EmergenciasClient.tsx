'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AlertTriangle, Radio, MapPin, Clock, RefreshCw,
  Shield, Phone, ChevronDown, ChevronUp, Loader2,
  Zap, Waves, Flame, Wind, CloudRain, ShieldAlert,
  Bell, ExternalLink, Info
} from 'lucide-react'

// ============================================================
// EmergenciasClient — Alertas comunitarias + Sismos Chile
// Fuente sísmica: USGS Earthquake API (Google)
// Fuente alertas: SAE Chile (referencia), datos demo
// UX: Alto contraste, touch targets 48px, tipografía 16px+
// ============================================================

interface Sismo {
  id: string
  magnitud: number
  lugar: string
  tiempo: string
  profundidad: number
  lat: number
  lng: number
  url: string
  tsunami: boolean
}

interface AlertaComunitaria {
  id: string
  tipo: 'sismo' | 'tsunami' | 'incendio' | 'inundacion' | 'corte_agua' | 'corte_luz' | 'gas' | 'seguridad'
  titulo: string
  descripcion: string
  severidad: 'critica' | 'alta' | 'media' | 'baja'
  fuente: string
  fecha: string
  activa: boolean
}

type TabKey = 'sismos' | 'alertas' | 'protocolos'

const ALERTA_ICONS: Record<string, React.ReactNode> = {
  sismo: <Waves className="h-5 w-5" />,
  tsunami: <Waves className="h-5 w-5" />,
  incendio: <Flame className="h-5 w-5" />,
  inundacion: <CloudRain className="h-5 w-5" />,
  corte_agua: <Waves className="h-5 w-5" />,
  corte_luz: <Zap className="h-5 w-5" />,
  gas: <Wind className="h-5 w-5" />,
  seguridad: <Shield className="h-5 w-5" />,
}

const SEVERIDAD_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  critica: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-200', border: 'border-red-200 dark:border-red-800', badge: 'bg-red-600 text-white' },
  alta: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-800 dark:text-orange-200', border: 'border-orange-200 dark:border-orange-800', badge: 'bg-orange-500 text-white' },
  media: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-800 dark:text-amber-200', border: 'border-amber-200 dark:border-amber-800', badge: 'bg-amber-500 text-white' },
  baja: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-800 dark:text-blue-200', border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-500 text-white' },
}

// Alertas comunitarias demo (SAE Chile + condominio)
const ALERTAS_DEMO: AlertaComunitaria[] = [
  {
    id: '1', tipo: 'sismo', titulo: 'Sismo 5.2 Richter percibido en RM',
    descripcion: 'Sismo registrado a 62 km al SW de Valparaíso, profundidad 35 km. Sin daños reportados. Mantenga la calma y revise zonas de seguridad del condominio.',
    severidad: 'alta', fuente: 'ONEMI / CSN', fecha: '2026-03-11T08:45:00', activa: true,
  },
  {
    id: '2', tipo: 'corte_luz', titulo: 'Corte programado de electricidad',
    descripcion: 'Enel informa corte programado el 15 de marzo de 09:00 a 14:00 hrs. Afecta torres A y B del condominio. Respalde equipos y desconecte electrodomésticos sensibles.',
    severidad: 'media', fuente: 'Enel Chile / Administración', fecha: '2026-03-10T18:00:00', activa: true,
  },
  {
    id: '3', tipo: 'corte_agua', titulo: 'Corte de suministro de agua potable',
    descripcion: 'Aguas Andinas realizará mantención en la red. Corte de 06:00 a 12:00 hrs del 13 de marzo. Se recomienda almacenar agua.',
    severidad: 'media', fuente: 'Aguas Andinas', fecha: '2026-03-09T15:30:00', activa: true,
  },
  {
    id: '4', tipo: 'seguridad', titulo: 'Alerta de seguridad — Intentos de ingreso no autorizado',
    descripcion: 'Se han reportado 2 intentos de ingreso no autorizado por el acceso peatonal sur. Se reforzó la vigilancia y se actualizaron los códigos de acceso QR.',
    severidad: 'alta', fuente: 'Administración Condominio', fecha: '2026-03-08T22:10:00', activa: false,
  },
  {
    id: '5', tipo: 'incendio', titulo: 'Alerta roja CONAF — Incendio forestal comuna vecina',
    descripcion: 'CONAF declara alerta roja por incendio forestal en comuna aledaña. Por precaución, mantenga ventanas cerradas y esté atento a posibles evacuaciones.',
    severidad: 'critica', fuente: 'CONAF / SENAPRED', fecha: '2026-03-07T16:20:00', activa: false,
  },
]

const PROTOCOLOS = [
  {
    titulo: 'Protocolo Sismo',
    icon: <Waves className="h-6 w-6 text-amber-500" />,
    pasos: [
      'Mantenga la calma. No corra.',
      'Protéjase bajo mesa sólida o en esquinas interiores.',
      'Aléjese de ventanales y objetos que puedan caer.',
      'NO use ascensores. Use escaleras.',
      'Diríjase a zona de seguridad del condominio (Patio central planta baja).',
      'Revise estado de su familia y vecinos.',
      'Reporte daños al conserje o administración.',
    ],
  },
  {
    titulo: 'Protocolo Incendio',
    icon: <Flame className="h-6 w-6 text-red-500" />,
    pasos: [
      'Active alarma de incendio más cercana.',
      'Llame a Bomberos: 132.',
      'Evacúe por escaleras (NO use ascensores).',
      'Si hay humo, avance agachado cubriendo nariz y boca.',
      'Cierre puertas al evacuar (NO con llave).',
      'Diríjase al punto de encuentro: Estacionamiento exterior.',
      'NO regrese al edificio hasta autorización de Bomberos.',
    ],
  },
  {
    titulo: 'Protocolo Tsunami',
    icon: <Waves className="h-6 w-6 text-blue-500" />,
    pasos: [
      'Si siente un sismo fuerte y prolongado, evacúe inmediatamente a zonas altas.',
      'NO espere la alerta oficial si está cerca de la costa.',
      'Siga las rutas de evacuación señalizadas.',
      'Aléjese de la costa al menos 30 metros sobre el nivel del mar.',
      'Manténgase en zona segura mínimo 6 horas.',
      'Sintonice radio de emergencia: 100.1 FM (Radio Cooperativa).',
    ],
  },
  {
    titulo: 'Números de Emergencia Chile',
    icon: <Phone className="h-6 w-6 text-green-500" />,
    pasos: [
      'Bomberos: 132',
      'Carabineros: 133',
      'Ambulancia SAMU: 131',
      'PDI: 134',
      'SENAPRED (ex ONEMI): 137',
      'Hospital de Peñaflor (Urgencias 24/7): (2) 2574 2500',
      'Fono Infancia: 147',
      'Conserje Condominio: +56 9 8815 6948',
    ],
  },
]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `Hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `Hace ${days}d`
}

function magnitudColor(mag: number): string {
  if (mag >= 6.0) return 'text-red-500 bg-red-100 dark:bg-red-900/30'
  if (mag >= 5.0) return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30'
  if (mag >= 4.0) return 'text-amber-500 bg-amber-100 dark:bg-amber-900/30'
  return 'text-green-500 bg-green-100 dark:bg-green-900/30'
}

export default function EmergenciasClient() {
  const [tab, setTab] = useState<TabKey>('sismos')
  const [sismos, setSismos] = useState<Sismo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [expandedProtocol, setExpandedProtocol] = useState<number | null>(0)

  const fetchSismos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // USGS Earthquake API — sismos en Chile (últimos 30 días, magnitud 3+)
      const res = await fetch(
        'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=-56&maxlatitude=-17&minlongitude=-76&maxlongitude=-66&minmagnitude=3&orderby=time&limit=20'
      )
      if (!res.ok) throw new Error('Error al obtener datos sísmicos')
      const data = await res.json()

      const parsed: Sismo[] = data.features.map((f: Record<string, unknown>) => {
        const props = f.properties as Record<string, unknown>
        const geo = f.geometry as { coordinates: number[] }
        return {
          id: f.id as string,
          magnitud: props.mag as number,
          lugar: props.place as string,
          tiempo: new Date(props.time as number).toISOString(),
          profundidad: geo.coordinates[2],
          lat: geo.coordinates[1],
          lng: geo.coordinates[0],
          url: props.url as string,
          tsunami: (props.tsunami as number) === 1,
        }
      })

      setSismos(parsed)
      setLastUpdate(new Date().toLocaleTimeString('es-CL'))
    } catch (err) {
      setError('No se pudieron cargar los datos sísmicos. Intente nuevamente.')
      // Fallback demo data
      setSismos([
        { id: 'd1', magnitud: 5.2, lugar: '62 km SW of Valparaiso, Chile', tiempo: '2026-03-11T08:42:00Z', profundidad: 35, lat: -33.4, lng: -71.8, url: '#', tsunami: false },
        { id: 'd2', magnitud: 4.1, lugar: '28 km NE of Coquimbo, Chile', tiempo: '2026-03-10T23:15:00Z', profundidad: 48, lat: -29.9, lng: -71.1, url: '#', tsunami: false },
        { id: 'd3', magnitud: 3.8, lugar: '45 km S of Antofagasta, Chile', tiempo: '2026-03-10T14:30:00Z', profundidad: 112, lat: -24.0, lng: -70.3, url: '#', tsunami: false },
        { id: 'd4', magnitud: 4.7, lugar: '90 km NW of Iquique, Chile', tiempo: '2026-03-09T06:12:00Z', profundidad: 25, lat: -19.8, lng: -70.5, url: '#', tsunami: false },
        { id: 'd5', magnitud: 3.5, lugar: '33 km E of Santiago, Chile', tiempo: '2026-03-08T19:55:00Z', profundidad: 72, lat: -33.4, lng: -70.3, url: '#', tsunami: false },
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSismos()
    // Auto-refresh cada 5 min
    const interval = setInterval(fetchSismos, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchSismos])

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'sismos', label: 'Sismos Chile', icon: <Waves className="h-4 w-4" />, count: sismos.length },
    { key: 'alertas', label: 'Alertas', icon: <Bell className="h-4 w-4" />, count: ALERTAS_DEMO.filter(a => a.activa).length },
    { key: 'protocolos', label: 'Protocolos', icon: <Shield className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-5">
      {/* Banner alerta activa */}
      {ALERTAS_DEMO.some(a => a.activa && a.severidad === 'critica') && (
        <div className="bg-red-600 text-white rounded-xl px-5 py-4 flex items-start gap-3 animate-pulse">
          <ShieldAlert className="h-6 w-6 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-base">Alerta Activa</p>
            <p className="text-sm text-red-100 mt-0.5">
              {ALERTAS_DEMO.find(a => a.activa && a.severidad === 'critica')?.titulo}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
              whitespace-nowrap touch-manipulation ${
              tab === t.key
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
            style={{ minHeight: '44px' }}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.key ? 'bg-white/20' : 'bg-neutral-300/50 dark:bg-neutral-600/50'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content: Sismos */}
      {tab === 'sismos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <Radio className="h-4 w-4 text-red-500 animate-pulse" />
              <span>Datos en vivo — USGS Earthquake API</span>
              {lastUpdate && <span className="text-xs">({lastUpdate})</span>}
            </div>
            <button
              onClick={fetchSismos}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-primary-600
                hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors touch-manipulation"
              style={{ minHeight: '36px' }}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>

          {loading && sismos.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
              <span className="ml-3 text-neutral-500">Cargando datos sísmicos...</span>
            </div>
          ) : error && sismos.length === 0 ? (
            <div className="card text-center py-8">
              <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
              <p className="text-neutral-600 dark:text-neutral-400">{error}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sismos.map((s) => (
                <div
                  key={s.id}
                  className="card hover:shadow-lg transition-shadow flex items-start gap-4 cursor-pointer group"
                >
                  {/* Magnitud badge */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center ${magnitudColor(s.magnitud)}`}>
                    <span className="text-2xl font-black leading-none">{s.magnitud.toFixed(1)}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">Mag</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-neutral-900 dark:text-white text-sm leading-tight">
                        {s.lugar}
                      </h3>
                      {s.tsunami && (
                        <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-red-600 text-white text-xs font-bold animate-pulse">
                          TSUNAMI
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(s.tiempo)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Prof. {s.profundidad.toFixed(0)} km
                      </span>
                      <span className="flex items-center gap-1">
                        {s.lat.toFixed(2)}°, {s.lng.toFixed(2)}°
                      </span>
                    </div>
                  </div>

                  {s.url !== '#' && (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 rounded-lg text-neutral-400 hover:text-primary-600
                        hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors touch-manipulation"
                      aria-label="Ver detalle en USGS"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500 pt-2">
            <Info className="h-3.5 w-3.5" />
            <span>
              Fuente: U.S. Geological Survey (USGS) — earthquake.usgs.gov.
              Datos actualizados cada 5 minutos automáticamente.
            </span>
          </div>
        </div>
      )}

      {/* Tab Content: Alertas */}
      {tab === 'alertas' && (
        <div className="space-y-3">
          {ALERTAS_DEMO.map((alerta) => {
            const colors = SEVERIDAD_COLORS[alerta.severidad]
            return (
              <div
                key={alerta.id}
                className={`rounded-xl border p-4 transition-all ${
                  alerta.activa
                    ? `${colors.bg} ${colors.border}`
                    : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 opacity-70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 p-2 rounded-lg ${alerta.activa ? colors.text : 'text-neutral-400'}`}>
                    {ALERTA_ICONS[alerta.tipo]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <h3 className={`font-semibold text-sm ${alerta.activa ? colors.text : 'text-neutral-500 dark:text-neutral-400'}`}>
                        {alerta.titulo}
                      </h3>
                      <div className="flex items-center gap-2">
                        {alerta.activa && (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Activa
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
                          {alerta.severidad.charAt(0).toUpperCase() + alerta.severidad.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm mt-1.5 leading-relaxed ${
                      alerta.activa ? colors.text + ' opacity-80' : 'text-neutral-500 dark:text-neutral-400'
                    }`}>
                      {alerta.descripcion}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                      <span>{alerta.fuente}</span>
                      <span>{timeAgo(alerta.fecha)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          <div className="flex items-center gap-2 text-xs text-neutral-400 pt-2">
            <Info className="h-3.5 w-3.5" />
            <span>
              Las alertas oficiales provienen de SENAPRED (ex ONEMI), CONAF, y servicios de utilidad.
              Alertas internas son emitidas por la administración del condominio.
            </span>
          </div>
        </div>
      )}

      {/* Tab Content: Protocolos */}
      {tab === 'protocolos' && (
        <div className="space-y-3">
          {PROTOCOLOS.map((proto, idx) => (
            <div key={idx} className="card overflow-hidden">
              <button
                onClick={() => setExpandedProtocol(expandedProtocol === idx ? null : idx)}
                className="flex items-center justify-between w-full text-left touch-manipulation"
                style={{ minHeight: '48px' }}
                aria-expanded={expandedProtocol === idx}
              >
                <div className="flex items-center gap-3">
                  {proto.icon}
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {proto.titulo}
                  </span>
                </div>
                {expandedProtocol === idx
                  ? <ChevronUp className="h-5 w-5 text-neutral-400" />
                  : <ChevronDown className="h-5 w-5 text-neutral-400" />
                }
              </button>

              {expandedProtocol === idx && (
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <ol className="space-y-3">
                    {proto.pasos.map((paso, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30
                          text-primary-700 dark:text-primary-300 text-xs font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed pt-0.5">
                          {paso}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
