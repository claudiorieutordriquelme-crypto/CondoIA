// ============================================================
// CondoIA — Tipos globales TypeScript
// ============================================================

export type UserRole =
  | 'superadmin'
  | 'administrador'
  | 'tesorero'
  | 'secretario'
  | 'copropietario'
  | 'arrendatario'

export type GastoEstado = 'pendiente' | 'pagado' | 'vencido' | 'en_cobranza'
export type AsambleaTipo = 'ordinaria' | 'extraordinaria' | 'de_emergencia'
export type AsambleaEstado = 'convocada' | 'en_curso' | 'finalizada' | 'cancelada'
export type AgenteTipo = 'administrador' | 'tesorero' | 'secretario'

export interface Condominio {
  id: string
  nombre: string
  rut_comunidad?: string
  direccion: string
  comuna: string
  region: string
  total_unidades: number
  plan_tipo: 'comunidad' | 'profesional' | 'enterprise'
  administrador_nombre?: string
  administrador_rut?: string
  administrador_certificado_url?: string
  administrador_vigencia?: string
  activo: boolean
  creado_en: string
}

export interface Perfil {
  id: string
  condominio_id?: string
  rol: UserRole
  nombre_completo: string
  rut?: string
  email?: string
  telefono?: string
  numero_unidad?: string
  piso?: number
  es_administrador_certificado: boolean
  numero_certificado?: string
  notificaciones_email: boolean
  tema: 'light' | 'dark' | 'system'
  creado_en: string
}

export interface Unidad {
  id: string
  condominio_id: string
  numero: string
  piso?: number
  tipo: 'departamento' | 'casa' | 'local' | 'estacionamiento' | 'bodega'
  metros_cuadrados?: number
  coeficiente: number
  propietario_id?: string
  saldo_pendiente: number
  meses_morosidad: number
  activo: boolean
}

export interface GastoComun {
  id: string
  condominio_id: string
  unidad_id: string
  periodo: string
  monto_base: number
  monto_extra: number
  monto_total: number
  interes_mora: number
  estado: GastoEstado
  fecha_vencimiento: string
  fecha_pago?: string
  metodo_pago?: string
  comprobante_url?: string
  notas?: string
  creado_en: string
}

export interface Asamblea {
  id: string
  condominio_id: string
  tipo: AsambleaTipo
  estado: AsambleaEstado
  titulo: string
  descripcion?: string
  fecha_convocatoria: string
  sala_virtual_url?: string
  quorum_requerido?: number
  quorum_alcanzado?: number
  acta_url?: string
  acta_firmada: boolean
  transcripcion?: string
  resumen_ia?: string
  creado_en: string
}

export interface Votacion {
  id: string
  asamblea_id: string
  numero: number
  titulo: string
  descripcion?: string
  tipo: 'simple' | 'calificada' | 'unanime'
  abierta: boolean
  resultado?: 'aprobado' | 'rechazado' | 'empate'
  votos_favor: number
  votos_contra: number
  abstenciones: number
}

export interface MensajeChat {
  id: string
  agente: AgenteTipo
  rol: 'user' | 'assistant'
  contenido: string
  creado_en: string
}

export interface Notificacion {
  id: string
  tipo: string
  titulo: string
  mensaje: string
  leida: boolean
  url?: string
  creado_en: string
}

// Dashboard stats types
export interface DashboardStats {
  total_unidades: number
  unidades_morosas: number
  recaudacion_mes: number
  recaudacion_esperada: number
  proxima_asamblea?: string
  solicitudes_abiertas: number
  tasa_pago: number
}

export interface AnthropicMessage {
  role: 'user' | 'assistant'
  content: string
}

// Document types
export interface Documento {
  id: string
  condominio_id: string
  titulo: string
  tipo_documento: 'acta' | 'reglamento' | 'financiero' | 'contrato' | 'correspondencia' | 'otro'
  archivo_url?: string
  size_bytes?: number
  firmado: boolean
  fecha_firma?: string
  firmado_por?: string
  creado_en: string
}

// Maintenance request types
export interface SolicitudMantenimiento {
  id: string
  condominio_id: string
  unidad_id: string
  titulo: string
  descripcion?: string
  categoria: 'plomeria' | 'electricidad' | 'areas_comunes' | 'ascensor' | 'limpieza' | 'otro'
  estado: 'abierta' | 'en_progreso' | 'resuelta' | 'cerrada'
  prioridad: 'baja' | 'media' | 'alta' | 'urgente'
  clasificacion_ia?: string
  creado_en: string
}

// Provider types
export interface Proveedor {
  id: string
  condominio_id: string
  nombre: string
  rut: string
  categoria: string
  telefono?: string
  email?: string
  calificacion_promedio?: number
  verificado: boolean
  notas?: string
  creado_en: string
}
