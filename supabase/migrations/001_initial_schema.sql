-- ============================================================
-- CondoIA — Migración Inicial
-- Ley 21.442 de Copropiedad Inmobiliaria — Chile
-- ============================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'superadmin',       -- Administrador de la plataforma CondoIA
  'administrador',    -- Administrador certificado del condominio (Ley 21.442 Art. 36)
  'tesorero',         -- Tesorero del comité de administración
  'secretario',       -- Secretario del comité de administración
  'copropietario',    -- Copropietario con acceso al portal
  'arrendatario'      -- Arrendatario con acceso limitado
);

CREATE TYPE gasto_estado AS ENUM (
  'pendiente',
  'pagado',
  'vencido',
  'en_cobranza'
);

CREATE TYPE asamblea_tipo AS ENUM (
  'ordinaria',        -- Anual obligatoria (Art. 17 Ley 21.442)
  'extraordinaria',   -- Convocada por administrador o copropietarios
  'de_emergencia'
);

CREATE TYPE asamblea_estado AS ENUM (
  'convocada',
  'en_curso',
  'finalizada',
  'cancelada'
);

CREATE TYPE notificacion_tipo AS ENUM (
  'gasto_emitido',
  'pago_recibido',
  'vencimiento_proximo',
  'asamblea_convocada',
  'documento_generado',
  'aviso_comunidad',
  'morosidad_alerta'
);

CREATE TYPE solicitud_estado AS ENUM (
  'abierta',
  'en_proceso',
  'resuelta',
  'cerrada'
);

-- ============================================================
-- TABLA: condominios
-- Entidad principal — representa cada condominio registrado
-- ============================================================

CREATE TABLE condominios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  rut_comunidad TEXT UNIQUE,           -- RUT de la comunidad (persona jurídica)
  direccion TEXT NOT NULL,
  comuna TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'Metropolitana',
  total_unidades INTEGER NOT NULL DEFAULT 0,
  reglamento_url TEXT,                  -- URL del reglamento de copropiedad en Supabase Storage
  plan_tipo TEXT NOT NULL DEFAULT 'comunidad', -- 'comunidad', 'profesional', 'enterprise'
  -- Datos del administrador certificado (Ley 21.442 Art. 36)
  administrador_nombre TEXT,
  administrador_rut TEXT,
  administrador_certificado_url TEXT,   -- Certificado de administrador acreditado
  administrador_vigencia DATE,
  -- Metadatos
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: perfiles
-- Extiende auth.users de Supabase con datos del sistema
-- ============================================================

CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  condominio_id UUID REFERENCES condominios(id) ON DELETE SET NULL,
  rol user_role NOT NULL DEFAULT 'copropietario',
  nombre_completo TEXT NOT NULL,
  rut TEXT,
  telefono TEXT,
  numero_unidad TEXT,                   -- Ej: "Depto 304", "Casa 12"
  piso INTEGER,
  -- Datos adicionales para administrador certificado
  es_administrador_certificado BOOLEAN DEFAULT FALSE,
  numero_certificado TEXT,              -- Número de certificación según Ley 21.442
  -- Preferencias
  notificaciones_email BOOLEAN DEFAULT TRUE,
  notificaciones_push BOOLEAN DEFAULT TRUE,
  idioma TEXT DEFAULT 'es',
  tema TEXT DEFAULT 'system',           -- 'light', 'dark', 'system'
  -- Metadatos
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: unidades
-- Unidades del condominio (departamentos, casas, locales)
-- ============================================================

CREATE TABLE unidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,                  -- "304", "Casa 12"
  piso INTEGER,
  tipo TEXT NOT NULL DEFAULT 'departamento', -- 'departamento', 'casa', 'local', 'estacionamiento', 'bodega'
  metros_cuadrados DECIMAL(8,2),
  coeficiente DECIMAL(10,8) NOT NULL DEFAULT 0, -- Prorrateo según tabla de copropiedad
  propietario_id UUID REFERENCES perfiles(id),
  arrendatario_id UUID REFERENCES perfiles(id),
  -- Estado financiero
  saldo_pendiente DECIMAL(12,2) NOT NULL DEFAULT 0,
  meses_morosidad INTEGER NOT NULL DEFAULT 0,
  -- Metadatos
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: gastos_comunes
-- Emisión mensual de gastos comunes
-- ============================================================

CREATE TABLE gastos_comunes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
  unidad_id UUID NOT NULL REFERENCES unidades(id),
  periodo TEXT NOT NULL,                 -- 'YYYY-MM' ej: '2026-03'
  monto_base DECIMAL(12,2) NOT NULL,
  monto_extra DECIMAL(12,2) DEFAULT 0,   -- Cobros adicionales
  monto_total DECIMAL(12,2) NOT NULL,
  interes_mora DECIMAL(12,2) DEFAULT 0,  -- Según Ley 21.442 Art. 27
  estado gasto_estado NOT NULL DEFAULT 'pendiente',
  fecha_vencimiento DATE NOT NULL,
  fecha_pago TIMESTAMPTZ,
  metodo_pago TEXT,                      -- 'transferencia', 'webpay', 'efectivo'
  comprobante_url TEXT,
  -- Generado por IA
  generado_por_ia BOOLEAN DEFAULT FALSE,
  notas TEXT,
  -- Metadatos
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: presupuesto_anual
-- Presupuesto del año del condominio (Art. 25 Ley 21.442)
-- ============================================================

CREATE TABLE presupuesto_anual (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES condominios(id),
  anio INTEGER NOT NULL,
  total_ingresos_proyectados DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_gastos_proyectados DECIMAL(14,2) NOT NULL DEFAULT 0,
  fondo_reserva DECIMAL(14,2) DEFAULT 0,  -- Fondo de reserva obligatorio Ley 21.442
  aprobado_en_asamblea BOOLEAN DEFAULT FALSE,
  asamblea_id UUID,
  documento_url TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: asambleas
-- Gestión de asambleas (Art. 17-21 Ley 21.442)
-- ============================================================

CREATE TABLE asambleas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
  tipo asamblea_tipo NOT NULL DEFAULT 'ordinaria',
  estado asamblea_estado NOT NULL DEFAULT 'convocada',
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_convocatoria TIMESTAMPTZ NOT NULL,  -- Fecha de citación (mínimo 5 días hábiles antes)
  fecha_primera_citacion TIMESTAMPTZ,
  fecha_segunda_citacion TIMESTAMPTZ,       -- Art. 18: segunda citación 30 min después
  sala_virtual_url TEXT,                    -- Link videoconferencia
  quorum_requerido DECIMAL(5,2),            -- % de unidades necesarias
  quorum_alcanzado DECIMAL(5,2),
  acta_url TEXT,                            -- Acta generada y firmada
  acta_firmada BOOLEAN DEFAULT FALSE,
  -- Generado por IA
  transcripcion TEXT,
  resumen_ia TEXT,
  creado_por UUID REFERENCES perfiles(id),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: asistencia_asamblea
-- Registro de asistentes (presenciales y virtuales)
-- ============================================================

CREATE TABLE asistencia_asamblea (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asamblea_id UUID NOT NULL REFERENCES asambleas(id) ON DELETE CASCADE,
  perfil_id UUID NOT NULL REFERENCES perfiles(id),
  unidad_id UUID REFERENCES unidades(id),
  asistio BOOLEAN DEFAULT FALSE,
  modalidad TEXT DEFAULT 'presencial',   -- 'presencial', 'virtual', 'delegado'
  delegado_de UUID REFERENCES perfiles(id),  -- Si vota por delegación
  firmado_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asamblea_id, perfil_id)
);

-- ============================================================
-- TABLA: votaciones
-- Votaciones en asamblea (Art. 18 Ley 21.442)
-- ============================================================

CREATE TABLE votaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asamblea_id UUID NOT NULL REFERENCES asambleas(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT DEFAULT 'simple',            -- 'simple', 'calificada', 'unanime'
  abierta BOOLEAN DEFAULT FALSE,
  resultado TEXT,                        -- 'aprobado', 'rechazado', 'empate'
  votos_favor INTEGER DEFAULT 0,
  votos_contra INTEGER DEFAULT 0,
  abstenciones INTEGER DEFAULT 0,
  cerrada_en TIMESTAMPTZ,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: votos
-- Registro de votos individuales
-- ============================================================

CREATE TABLE votos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  votacion_id UUID NOT NULL REFERENCES votaciones(id) ON DELETE CASCADE,
  perfil_id UUID NOT NULL REFERENCES perfiles(id),
  voto TEXT NOT NULL,                    -- 'favor', 'contra', 'abstencion'
  hash_verificacion TEXT,                -- Para auditoría
  votado_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(votacion_id, perfil_id)
);

-- ============================================================
-- TABLA: documentos
-- Repositorio de documentos del condominio
-- ============================================================

CREATE TABLE documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES condominios(id),
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,                    -- 'acta', 'reglamento', 'contrato', 'certificado', 'informe'
  url TEXT NOT NULL,
  tamano_bytes INTEGER,
  generado_por_ia BOOLEAN DEFAULT FALSE,
  firmado_electronicamente BOOLEAN DEFAULT FALSE,
  firmado_por UUID REFERENCES perfiles(id),
  firmado_en TIMESTAMPTZ,
  publico BOOLEAN DEFAULT FALSE,         -- Visible para todos los copropietarios
  creado_por UUID REFERENCES perfiles(id),
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: solicitudes_mantenimiento
-- Solicitudes de mantención con clasificación por IA
-- ============================================================

CREATE TABLE solicitudes_mantenimiento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES condominios(id),
  solicitante_id UUID NOT NULL REFERENCES perfiles(id),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  categoria TEXT,                        -- 'ascensor', 'gasfiteria', 'electricidad', etc.
  prioridad TEXT DEFAULT 'media',        -- 'critica', 'alta', 'media', 'baja'
  prioridad_ia TEXT,                     -- Prioridad sugerida por IA
  estado solicitud_estado DEFAULT 'abierta',
  imagen_url TEXT,
  resuelto_en TIMESTAMPTZ,
  notas_resolucion TEXT,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: proveedores
-- Marketplace de proveedores verificados
-- ============================================================

CREATE TABLE proveedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  rut TEXT UNIQUE,
  categoria TEXT NOT NULL,               -- 'limpieza', 'jardinería', 'electricidad', etc.
  descripcion TEXT,
  telefono TEXT,
  email TEXT,
  calificacion_promedio DECIMAL(3,2) DEFAULT 0,
  total_resenas INTEGER DEFAULT 0,
  verificado BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: chat_agentes
-- Historial de conversaciones con agentes IA
-- ============================================================

CREATE TABLE chat_agentes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES condominios(id),
  perfil_id UUID NOT NULL REFERENCES perfiles(id),
  agente TEXT NOT NULL,                  -- 'administrador', 'tesorero', 'secretario'
  rol TEXT NOT NULL,                     -- 'user', 'assistant'
  contenido TEXT NOT NULL,
  tokens_usados INTEGER,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: notificaciones
-- Centro de notificaciones del sistema
-- ============================================================

CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  perfil_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  condominio_id UUID REFERENCES condominios(id),
  tipo notificacion_tipo NOT NULL,
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT FALSE,
  url TEXT,                              -- Deep link a la sección relevante
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES — Performance crítico
-- ============================================================

CREATE INDEX idx_gastos_condominio_periodo ON gastos_comunes(condominio_id, periodo);
CREATE INDEX idx_gastos_unidad ON gastos_comunes(unidad_id);
CREATE INDEX idx_gastos_estado ON gastos_comunes(estado);
CREATE INDEX idx_perfiles_condominio ON perfiles(condominio_id);
CREATE INDEX idx_perfiles_rol ON perfiles(rol);
CREATE INDEX idx_unidades_condominio ON unidades(condominio_id);
CREATE INDEX idx_asambleas_condominio ON asambleas(condominio_id);
CREATE INDEX idx_notificaciones_perfil ON notificaciones(perfil_id, leida);
CREATE INDEX idx_chat_perfil_agente ON chat_agentes(perfil_id, agente);
CREATE INDEX idx_documentos_condominio ON documentos(condominio_id, tipo);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Seguridad a nivel de fila — principio de mínimo privilegio
-- ============================================================

ALTER TABLE condominios ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos_comunes ENABLE ROW LEVEL SECURITY;
ALTER TABLE asambleas ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_agentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_mantenimiento ENABLE ROW LEVEL SECURITY;

-- Función helper: obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT rol FROM perfiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Función helper: obtener el condominio del usuario actual
CREATE OR REPLACE FUNCTION get_user_condominio()
RETURNS UUID AS $$
  SELECT condominio_id FROM perfiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Políticas: perfiles
CREATE POLICY "Usuarios ven su propio perfil"
  ON perfiles FOR SELECT
  USING (id = auth.uid() OR condominio_id = get_user_condominio());

CREATE POLICY "Usuarios actualizan su propio perfil"
  ON perfiles FOR UPDATE
  USING (id = auth.uid());

-- Políticas: gastos_comunes
CREATE POLICY "Copropietarios ven sus gastos"
  ON gastos_comunes FOR SELECT
  USING (
    condominio_id = get_user_condominio()
    AND (
      get_user_role() IN ('administrador', 'tesorero', 'superadmin')
      OR unidad_id IN (SELECT id FROM unidades WHERE propietario_id = auth.uid() OR arrendatario_id = auth.uid())
    )
  );

CREATE POLICY "Administradores y tesoreros gestionan gastos"
  ON gastos_comunes FOR ALL
  USING (
    condominio_id = get_user_condominio()
    AND get_user_role() IN ('administrador', 'tesorero', 'superadmin')
  );

-- Políticas: asambleas
CREATE POLICY "Todos los miembros ven asambleas de su condominio"
  ON asambleas FOR SELECT
  USING (condominio_id = get_user_condominio());

CREATE POLICY "Administradores y secretarios gestionan asambleas"
  ON asambleas FOR ALL
  USING (
    condominio_id = get_user_condominio()
    AND get_user_role() IN ('administrador', 'secretario', 'superadmin')
  );

-- Políticas: notificaciones
CREATE POLICY "Usuarios ven solo sus notificaciones"
  ON notificaciones FOR ALL
  USING (perfil_id = auth.uid());

-- Políticas: chat
CREATE POLICY "Usuarios ven su propio chat con agentes"
  ON chat_agentes FOR ALL
  USING (perfil_id = auth.uid());

-- ============================================================
-- TRIGGERS — Auto-actualización de timestamps
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_condominios_updated
  BEFORE UPDATE ON condominios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_perfiles_updated
  BEFORE UPDATE ON perfiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_gastos_updated
  BEFORE UPDATE ON gastos_comunes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- FUNCIÓN: crear perfil automáticamente al registrarse
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO perfiles (id, nombre_completo, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'rol')::user_role, 'copropietario')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- FUNCIÓN: calcular morosidad automáticamente
-- ============================================================

CREATE OR REPLACE FUNCTION actualizar_morosidad()
RETURNS VOID AS $$
BEGIN
  UPDATE unidades u
  SET
    saldo_pendiente = (
      SELECT COALESCE(SUM(monto_total + interes_mora), 0)
      FROM gastos_comunes g
      WHERE g.unidad_id = u.id AND g.estado IN ('pendiente', 'vencido', 'en_cobranza')
    ),
    meses_morosidad = (
      SELECT COUNT(DISTINCT periodo)
      FROM gastos_comunes g
      WHERE g.unidad_id = u.id AND g.estado IN ('vencido', 'en_cobranza')
    );
END;
$$ LANGUAGE plpgsql;
