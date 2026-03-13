-- ============================================================
-- CondoIA — Migración 002: Multi-Tenant & Consola Reseller
-- Arquitectura multi-condominio con aislamiento RLS
-- ============================================================

-- ============================================================
-- NUEVOS ENUM TYPES
-- ============================================================

CREATE TYPE estado_cuenta AS ENUM (
  'pendiente_aprobacion',  -- Registro self-service sin aprobar
  'activo',                -- Cuenta operativa
  'suspendido',            -- Suspendida por superadmin (temporalmente inactiva)
  'cancelado'              -- Dada de baja definitivamente
);

CREATE TYPE estado_suscripcion AS ENUM (
  'trial',        -- Período de prueba gratuito
  'activa',       -- Suscripción activa y pagada
  'suspendida',   -- Pago vencido o suspensión manual
  'cancelada',    -- Cancelación definitiva
  'vencida'       -- Período finalizado sin renovación
);

-- ============================================================
-- TABLA: planes
-- Planes de suscripción disponibles en la plataforma
-- ============================================================

CREATE TABLE planes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  precio_mensual DECIMAL(12,2) NOT NULL DEFAULT 0,
  precio_anual DECIMAL(12,2),              -- Descuento por pago anual
  moneda TEXT NOT NULL DEFAULT 'CLP',
  -- Límites
  max_unidades INTEGER,                     -- NULL = ilimitado
  max_usuarios INTEGER,
  max_storage_mb INTEGER DEFAULT 500,
  max_consultas_ia_mes INTEGER DEFAULT 100,
  -- Features
  funciones_ia BOOLEAN DEFAULT FALSE,
  reportes_avanzados BOOLEAN DEFAULT FALSE,
  soporte_prioritario BOOLEAN DEFAULT FALSE,
  white_labeling BOOLEAN DEFAULT FALSE,
  api_access BOOLEAN DEFAULT FALSE,
  -- Metadatos
  orden INTEGER NOT NULL DEFAULT 0,         -- Orden de display
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ALTER: condominios — Nuevas columnas para multi-tenancy
-- ============================================================

ALTER TABLE condominios
  ADD COLUMN IF NOT EXISTS estado_cuenta estado_cuenta NOT NULL DEFAULT 'activo',
  ADD COLUMN IF NOT EXISTS creado_por UUID REFERENCES perfiles(id),
  ADD COLUMN IF NOT EXISTS aprobado_por UUID REFERENCES perfiles(id),
  ADD COLUMN IF NOT EXISTS aprobado_en TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS motivo_suspension TEXT,
  ADD COLUMN IF NOT EXISTS suspendido_en TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspendido_por UUID REFERENCES perfiles(id),
  -- White-labeling
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS color_primario TEXT DEFAULT '#3B82F6',
  ADD COLUMN IF NOT EXISTS color_secundario TEXT DEFAULT '#1E293B',
  ADD COLUMN IF NOT EXISTS dominio_personalizado TEXT,
  -- Notas internas del superadmin
  ADD COLUMN IF NOT EXISTS notas_internas TEXT;

-- Migrar el campo activo existente al nuevo estado_cuenta
-- Los condominios con activo=false pasan a 'suspendido'
UPDATE condominios SET estado_cuenta = 'suspendido' WHERE activo = FALSE;

-- Índice para búsquedas frecuentes del superadmin
CREATE INDEX IF NOT EXISTS idx_condominios_estado ON condominios(estado_cuenta);
CREATE INDEX IF NOT EXISTS idx_condominios_plan ON condominios(plan_tipo);

-- ============================================================
-- TABLA: suscripciones
-- Vincula condominios con planes y gestiona facturación
-- ============================================================

CREATE TABLE suscripciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES planes(id),
  estado estado_suscripcion NOT NULL DEFAULT 'trial',
  -- Período
  fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_fin TIMESTAMPTZ,
  trial_hasta TIMESTAMPTZ,                  -- Fin del trial gratuito
  -- Facturación
  ciclo TEXT NOT NULL DEFAULT 'mensual',    -- 'mensual', 'anual'
  monto DECIMAL(12,2) NOT NULL DEFAULT 0,
  moneda TEXT NOT NULL DEFAULT 'CLP',
  auto_renovar BOOLEAN DEFAULT TRUE,
  metodo_pago TEXT,                         -- 'transferencia', 'webpay', 'flow'
  -- Último pago
  ultimo_pago_fecha TIMESTAMPTZ,
  ultimo_pago_monto DECIMAL(12,2),
  proximo_cobro TIMESTAMPTZ,
  -- Metadatos
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Una suscripción activa por condominio
  UNIQUE(condominio_id, estado) -- No permite dos suscripciones activas simultáneas
);

CREATE INDEX idx_suscripciones_condominio ON suscripciones(condominio_id);
CREATE INDEX idx_suscripciones_estado ON suscripciones(estado);
CREATE INDEX idx_suscripciones_proximo_cobro ON suscripciones(proximo_cobro);

-- ============================================================
-- TABLA: facturas
-- Registro de facturación para cada condominio
-- ============================================================

CREATE TABLE facturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suscripcion_id UUID NOT NULL REFERENCES suscripciones(id),
  condominio_id UUID NOT NULL REFERENCES condominios(id),
  numero_factura TEXT UNIQUE,               -- Correlativo: COND-2026-0001
  periodo TEXT NOT NULL,                    -- 'YYYY-MM'
  monto DECIMAL(12,2) NOT NULL,
  impuesto DECIMAL(12,2) DEFAULT 0,         -- IVA 19%
  total DECIMAL(12,2) NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente', -- 'pendiente', 'pagada', 'vencida', 'anulada'
  fecha_emision TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_vencimiento TIMESTAMPTZ NOT NULL,
  fecha_pago TIMESTAMPTZ,
  metodo_pago TEXT,
  comprobante_url TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_facturas_condominio ON facturas(condominio_id, periodo);
CREATE INDEX idx_facturas_estado ON facturas(estado);

-- ============================================================
-- TABLA: audit_log
-- Registro inmutable de acciones críticas
-- ============================================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES perfiles(id),    -- NULL para acciones del sistema
  condominio_id UUID REFERENCES condominios(id),
  accion TEXT NOT NULL,                     -- 'crear_condominio', 'suspender', 'cambiar_plan', etc.
  entidad TEXT,                             -- Tabla afectada
  entidad_id UUID,                          -- ID del registro afectado
  datos_antes JSONB,                        -- Snapshot antes del cambio
  datos_despues JSONB,                      -- Snapshot después del cambio
  descripcion TEXT,                         -- Descripción legible de la acción
  ip_address INET,
  user_agent TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Solo el superadmin lee audit_log, pero necesitamos índices para filtros
CREATE INDEX idx_audit_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_condominio ON audit_log(condominio_id);
CREATE INDEX idx_audit_accion ON audit_log(accion);
CREATE INDEX idx_audit_fecha ON audit_log(creado_en DESC);

-- ============================================================
-- TABLA: platform_metrics
-- Métricas agregadas para dashboard del superadmin
-- ============================================================

CREATE TABLE platform_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id), -- NULL = métrica global
  periodo TEXT NOT NULL,                    -- 'YYYY-MM'
  -- Uso
  usuarios_activos INTEGER DEFAULT 0,
  usuarios_totales INTEGER DEFAULT 0,
  unidades_registradas INTEGER DEFAULT 0,
  storage_usado_mb DECIMAL(10,2) DEFAULT 0,
  -- IA
  consultas_ia INTEGER DEFAULT 0,
  documentos_generados INTEGER DEFAULT 0,
  -- Financiero
  ingresos_facturados DECIMAL(14,2) DEFAULT 0,
  ingresos_cobrados DECIMAL(14,2) DEFAULT 0,
  -- Engagement
  logins_totales INTEGER DEFAULT 0,
  pagos_procesados INTEGER DEFAULT 0,
  asambleas_realizadas INTEGER DEFAULT 0,
  -- Metadatos
  calculado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(condominio_id, periodo)
);

CREATE INDEX idx_metrics_periodo ON platform_metrics(periodo);

-- ============================================================
-- ALTER: perfiles — Nuevas columnas
-- ============================================================

ALTER TABLE perfiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS ultimo_login TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS suspendido_por UUID REFERENCES perfiles(id),
  ADD COLUMN IF NOT EXISTS motivo_suspension TEXT;

-- Poblar email desde auth.users para perfiles existentes
UPDATE perfiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- ============================================================
-- ACTUALIZAR handle_new_user() para incluir email
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO perfiles (id, nombre_completo, rol, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'rol')::user_role, 'copropietario'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCIÓN: registrar último login
-- ============================================================

CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE perfiles SET ultimo_login = NOW() WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger en auth.sessions (si disponible) o manual desde el frontend

-- ============================================================
-- FUNCIÓN: log de auditoría
-- ============================================================

CREATE OR REPLACE FUNCTION log_audit(
  p_accion TEXT,
  p_entidad TEXT DEFAULT NULL,
  p_entidad_id UUID DEFAULT NULL,
  p_condominio_id UUID DEFAULT NULL,
  p_datos_antes JSONB DEFAULT NULL,
  p_datos_despues JSONB DEFAULT NULL,
  p_descripcion TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO audit_log (actor_id, condominio_id, accion, entidad, entidad_id, datos_antes, datos_despues, descripcion)
  VALUES (auth.uid(), p_condominio_id, p_accion, p_entidad, p_entidad_id, p_datos_antes, p_datos_despues, p_descripcion)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCIÓN: aprobar condominio
-- ============================================================

CREATE OR REPLACE FUNCTION aprobar_condominio(p_condominio_id UUID, p_plan_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
  v_plan_id UUID;
BEGIN
  -- Verificar que el actor es superadmin
  IF get_user_role() != 'superadmin' THEN
    RAISE EXCEPTION 'Solo superadmin puede aprobar condominios';
  END IF;

  -- Usar plan comunidad (gratuito) si no se especifica
  IF p_plan_id IS NULL THEN
    SELECT id INTO v_plan_id FROM planes WHERE nombre = 'comunidad' LIMIT 1;
  ELSE
    v_plan_id := p_plan_id;
  END IF;

  -- Activar condominio
  UPDATE condominios
  SET estado_cuenta = 'activo',
      aprobado_por = auth.uid(),
      aprobado_en = NOW(),
      activo = TRUE
  WHERE id = p_condominio_id;

  -- Crear suscripción con trial de 30 días
  INSERT INTO suscripciones (condominio_id, plan_id, estado, trial_hasta)
  VALUES (p_condominio_id, v_plan_id, 'trial', NOW() + INTERVAL '30 days');

  -- Log de auditoría
  PERFORM log_audit(
    'aprobar_condominio',
    'condominios',
    p_condominio_id,
    p_condominio_id,
    NULL,
    jsonb_build_object('estado_cuenta', 'activo', 'aprobado_por', auth.uid()::text),
    'Condominio aprobado con trial de 30 días'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCIÓN: suspender condominio
-- ============================================================

CREATE OR REPLACE FUNCTION suspender_condominio(p_condominio_id UUID, p_motivo TEXT DEFAULT 'Sin especificar')
RETURNS VOID AS $$
BEGIN
  IF get_user_role() != 'superadmin' THEN
    RAISE EXCEPTION 'Solo superadmin puede suspender condominios';
  END IF;

  UPDATE condominios
  SET estado_cuenta = 'suspendido',
      motivo_suspension = p_motivo,
      suspendido_en = NOW(),
      suspendido_por = auth.uid(),
      activo = FALSE
  WHERE id = p_condominio_id;

  -- Suspender suscripción activa
  UPDATE suscripciones
  SET estado = 'suspendida'
  WHERE condominio_id = p_condominio_id AND estado IN ('activa', 'trial');

  PERFORM log_audit(
    'suspender_condominio',
    'condominios',
    p_condominio_id,
    p_condominio_id,
    NULL,
    jsonb_build_object('motivo', p_motivo),
    'Condominio suspendido: ' || p_motivo
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCIÓN: reactivar condominio
-- ============================================================

CREATE OR REPLACE FUNCTION reactivar_condominio(p_condominio_id UUID)
RETURNS VOID AS $$
BEGIN
  IF get_user_role() != 'superadmin' THEN
    RAISE EXCEPTION 'Solo superadmin puede reactivar condominios';
  END IF;

  UPDATE condominios
  SET estado_cuenta = 'activo',
      motivo_suspension = NULL,
      suspendido_en = NULL,
      suspendido_por = NULL,
      activo = TRUE
  WHERE id = p_condominio_id;

  -- Reactivar suscripción
  UPDATE suscripciones
  SET estado = 'activa'
  WHERE condominio_id = p_condominio_id AND estado = 'suspendida';

  PERFORM log_audit(
    'reactivar_condominio',
    'condominios',
    p_condominio_id,
    p_condominio_id,
    NULL,
    jsonb_build_object('estado_cuenta', 'activo'),
    'Condominio reactivado'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RLS: Nuevas tablas
-- ============================================================

ALTER TABLE planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;

-- Planes: todos pueden leer, solo superadmin modifica
CREATE POLICY "planes_lectura_publica" ON planes
  FOR SELECT USING (TRUE);

CREATE POLICY "planes_gestion_superadmin" ON planes
  FOR ALL USING (get_user_role() = 'superadmin');

-- Suscripciones: superadmin ve todas, admin ve la suya
CREATE POLICY "suscripciones_superadmin" ON suscripciones
  FOR ALL USING (get_user_role() = 'superadmin');

CREATE POLICY "suscripciones_admin_lectura" ON suscripciones
  FOR SELECT USING (condominio_id = get_user_condominio());

-- Facturas: igual que suscripciones
CREATE POLICY "facturas_superadmin" ON facturas
  FOR ALL USING (get_user_role() = 'superadmin');

CREATE POLICY "facturas_admin_lectura" ON facturas
  FOR SELECT USING (
    condominio_id = get_user_condominio()
    AND get_user_role() IN ('administrador', 'tesorero')
  );

-- Audit log: solo superadmin
CREATE POLICY "audit_solo_superadmin" ON audit_log
  FOR SELECT USING (get_user_role() = 'superadmin');

CREATE POLICY "audit_insert_system" ON audit_log
  FOR INSERT WITH CHECK (TRUE); -- Cualquiera puede insertar (via función SECURITY DEFINER)

-- Platform metrics: solo superadmin
CREATE POLICY "metrics_solo_superadmin" ON platform_metrics
  FOR ALL USING (get_user_role() = 'superadmin');

-- ============================================================
-- RLS: Reforzar superadmin en tablas existentes
-- ============================================================

-- Condominios: superadmin ve todos
CREATE POLICY "condominios_superadmin_full"
  ON condominios FOR ALL
  USING (get_user_role() = 'superadmin');

CREATE POLICY "condominios_miembros_lectura"
  ON condominios FOR SELECT
  USING (id = get_user_condominio());

-- Perfiles: superadmin ve todos los perfiles
CREATE POLICY "perfiles_superadmin_full"
  ON perfiles FOR ALL
  USING (get_user_role() = 'superadmin');

-- Unidades: superadmin ve todas
CREATE POLICY "unidades_superadmin_full"
  ON unidades FOR ALL
  USING (get_user_role() = 'superadmin');

CREATE POLICY "unidades_miembros"
  ON unidades FOR SELECT
  USING (condominio_id = get_user_condominio());

-- Solicitudes mantenimiento: superadmin
CREATE POLICY "mantenimiento_superadmin"
  ON solicitudes_mantenimiento FOR ALL
  USING (get_user_role() = 'superadmin');

CREATE POLICY "mantenimiento_condominio"
  ON solicitudes_mantenimiento FOR ALL
  USING (condominio_id = get_user_condominio());

-- Documentos: superadmin
CREATE POLICY "documentos_superadmin"
  ON documentos FOR ALL
  USING (get_user_role() = 'superadmin');

CREATE POLICY "documentos_condominio"
  ON documentos FOR SELECT
  USING (condominio_id = get_user_condominio());

-- ============================================================
-- DATOS INICIALES: Planes de suscripción
-- ============================================================

INSERT INTO planes (nombre, descripcion, precio_mensual, precio_anual, max_unidades, max_usuarios, max_storage_mb, max_consultas_ia_mes, funciones_ia, reportes_avanzados, soporte_prioritario, white_labeling, api_access, orden)
VALUES
  ('comunidad', 'Plan gratuito para comunidades pequeñas', 0, 0, 20, 30, 200, 50, FALSE, FALSE, FALSE, FALSE, FALSE, 1),
  ('profesional', 'Para condominios medianos con IA y reportes', 29990, 299900, 100, 150, 2000, 500, TRUE, TRUE, FALSE, FALSE, FALSE, 2),
  ('enterprise', 'Grandes condominios con todas las funciones', 79990, 799900, NULL, NULL, 10000, NULL, TRUE, TRUE, TRUE, TRUE, TRUE, 3)
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- TRIGGER: auto-actualización de timestamps en nuevas tablas
-- ============================================================

CREATE TRIGGER trg_planes_updated
  BEFORE UPDATE ON planes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_suscripciones_updated
  BEFORE UPDATE ON suscripciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- VISTA: resumen de condominios para consola superadmin
-- ============================================================

CREATE OR REPLACE VIEW v_condominios_resumen AS
SELECT
  c.id,
  c.nombre,
  c.rut_comunidad,
  c.direccion,
  c.comuna,
  c.region,
  c.total_unidades,
  c.estado_cuenta,
  c.plan_tipo,
  c.activo,
  c.creado_en,
  c.aprobado_en,
  c.logo_url,
  c.color_primario,
  c.notas_internas,
  -- Administrador
  c.administrador_nombre,
  c.administrador_rut,
  -- Conteos
  (SELECT COUNT(*) FROM perfiles p WHERE p.condominio_id = c.id) AS total_usuarios,
  (SELECT COUNT(*) FROM unidades u WHERE u.condominio_id = c.id) AS unidades_registradas,
  (SELECT COUNT(*) FROM perfiles p WHERE p.condominio_id = c.id AND p.ultimo_login > NOW() - INTERVAL '30 days') AS usuarios_activos_30d,
  -- Suscripción actual
  s.estado AS estado_suscripcion,
  pl.nombre AS plan_nombre,
  s.trial_hasta,
  s.proximo_cobro,
  -- Último login de cualquier usuario del condominio
  (SELECT MAX(p.ultimo_login) FROM perfiles p WHERE p.condominio_id = c.id) AS ultimo_acceso
FROM condominios c
LEFT JOIN LATERAL (
  SELECT * FROM suscripciones
  WHERE condominio_id = c.id
  ORDER BY creado_en DESC LIMIT 1
) s ON TRUE
LEFT JOIN planes pl ON s.plan_id = pl.id;
