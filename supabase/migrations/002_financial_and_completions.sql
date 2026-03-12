-- ============================================================
-- CondoIA — Migración 002: Movimientos Financieros, Compromisos,
-- Agenda, Adjuntos, RLS completo y Storage
-- ============================================================

-- ============================================================
-- ENUM TYPES ADICIONALES
-- ============================================================

CREATE TYPE movimiento_tipo AS ENUM ('ingreso', 'egreso');

CREATE TYPE ingreso_categoria AS ENUM (
  'gasto_comun',       -- Cuota mensual de gastos comunes
  'fondo_reserva',     -- Aporte al fondo de reserva (Art. 25 Ley 21.442)
  'multa',             -- Multas e intereses por morosidad
  'arriendo',          -- Arriendo de espacios comunes (salón, estacionamiento)
  'extraordinario'     -- Cuotas extraordinarias aprobadas en asamblea
);

CREATE TYPE egreso_categoria AS ENUM (
  'servicios_basicos',  -- Electricidad, agua, gas áreas comunes
  'mantenimiento',      -- Ascensores, bombas, equipos
  'seguridad',          -- Vigilancia, cámaras, control acceso
  'seguros',            -- Póliza de incendio obligatoria + otros
  'limpieza',           -- Aseo áreas comunes, jardinería
  'administracion',     -- Honorarios administrador, contabilidad
  'reparaciones',       -- Reparaciones extraordinarias
  'otros'               -- Gastos menores, insumos
);

CREATE TYPE metodo_pago AS ENUM (
  'transferencia',
  'pago_linea',
  'efectivo',
  'cheque',
  'debito_automatico',
  'webpay'
);

CREATE TYPE compromiso_estado AS ENUM (
  'pendiente',
  'en_progreso',
  'cumplido',
  'vencido'
);

CREATE TYPE rsvp_estado AS ENUM (
  'confirmado',
  'rechazado',
  'pendiente'
);

-- ============================================================
-- TABLA: movimientos_financieros
-- Registro unificado de ingresos y egresos del condominio
-- ============================================================

CREATE TABLE movimientos_financieros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,

  -- Clasificación
  tipo movimiento_tipo NOT NULL,
  categoria_ingreso ingreso_categoria,       -- Solo si tipo = 'ingreso'
  categoria_egreso egreso_categoria,          -- Solo si tipo = 'egreso'

  -- Datos del movimiento
  descripcion TEXT NOT NULL,
  monto DECIMAL(14,2) NOT NULL CHECK (monto > 0),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  metodo metodo_pago NOT NULL DEFAULT 'transferencia',

  -- Referencias opcionales
  unidad_id UUID REFERENCES unidades(id),           -- Si es pago de copropietario
  proveedor_id UUID REFERENCES proveedores(id),     -- Si es pago a proveedor
  gasto_comun_id UUID REFERENCES gastos_comunes(id), -- Si se concilia con gasto emitido
  comprobante_url TEXT,                              -- URL en Storage

  -- Conciliación bancaria (futuro: Fintoc/Khipu)
  referencia_bancaria TEXT,           -- N° operación bancaria
  conciliado BOOLEAN DEFAULT FALSE,   -- ¿Verificado contra extracto?
  conciliado_en TIMESTAMPTZ,
  conciliado_por UUID REFERENCES perfiles(id),

  -- Auditoría
  registrado_por UUID NOT NULL REFERENCES perfiles(id),
  anulado BOOLEAN DEFAULT FALSE,
  anulado_en TIMESTAMPTZ,
  anulado_por UUID REFERENCES perfiles(id),
  motivo_anulacion TEXT,
  notas TEXT,

  -- Metadatos
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Validaciones
  CONSTRAINT chk_categoria_ingreso CHECK (
    (tipo = 'ingreso' AND categoria_ingreso IS NOT NULL) OR
    (tipo = 'egreso' AND categoria_ingreso IS NULL)
  ),
  CONSTRAINT chk_categoria_egreso CHECK (
    (tipo = 'egreso' AND categoria_egreso IS NOT NULL) OR
    (tipo = 'ingreso' AND categoria_egreso IS NULL)
  )
);

-- ============================================================
-- TABLA: agenda_items
-- Temas de la agenda de una asamblea
-- ============================================================

CREATE TABLE agenda_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asamblea_id UUID NOT NULL REFERENCES asambleas(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,             -- Orden en la agenda
  tema TEXT NOT NULL,
  descripcion TEXT,
  -- Resultados (se completan durante/después de la asamblea)
  acuerdo TEXT,                        -- Acuerdo alcanzado
  votos_favor INTEGER DEFAULT 0,
  votos_contra INTEGER DEFAULT 0,
  votos_abstencion INTEGER DEFAULT 0,
  -- Metadatos
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asamblea_id, numero)
);

-- ============================================================
-- TABLA: compromisos
-- Compromisos derivados de asambleas o creados manualmente
-- ============================================================

CREATE TABLE compromisos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
  asamblea_id UUID REFERENCES asambleas(id) ON DELETE SET NULL,
  agenda_item_id UUID REFERENCES agenda_items(id) ON DELETE SET NULL,

  -- Contenido
  texto TEXT NOT NULL,
  responsable TEXT NOT NULL,          -- Nombre del responsable
  responsable_id UUID REFERENCES perfiles(id),

  -- Plazos
  fecha_compromiso DATE NOT NULL,     -- Fecha límite
  fecha_cumplimiento DATE,            -- Fecha en que se cumplió

  -- Estado
  estado compromiso_estado NOT NULL DEFAULT 'pendiente',
  notas TEXT,
  evidencia_url TEXT,                 -- Comprobante de cumplimiento

  -- Auditoría
  creado_por UUID REFERENCES perfiles(id),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: adjuntos_asamblea
-- Archivos adjuntos a una asamblea
-- ============================================================

CREATE TABLE adjuntos_asamblea (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asamblea_id UUID NOT NULL REFERENCES asambleas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,                  -- 'pdf', 'xlsx', 'docx', 'img'
  tamano_bytes INTEGER,
  url TEXT NOT NULL,                   -- URL en Supabase Storage
  subido_por UUID REFERENCES perfiles(id),
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: rsvp_asamblea
-- Confirmación de asistencia a asambleas
-- ============================================================

CREATE TABLE rsvp_asamblea (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asamblea_id UUID NOT NULL REFERENCES asambleas(id) ON DELETE CASCADE,
  perfil_id UUID NOT NULL REFERENCES perfiles(id),
  estado rsvp_estado NOT NULL DEFAULT 'pendiente',
  respondido_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asamblea_id, perfil_id)
);

-- ============================================================
-- TABLA: compromisos_pago
-- Convenios de pago para morosos (negociados)
-- ============================================================

CREATE TABLE compromisos_pago (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES condominios(id),
  unidad_id UUID NOT NULL REFERENCES unidades(id),
  perfil_id UUID NOT NULL REFERENCES perfiles(id),
  deuda_total DECIMAL(14,2) NOT NULL,
  cuotas INTEGER NOT NULL DEFAULT 1,
  monto_cuota DECIMAL(14,2) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: auditoria
-- Log de auditoría para cumplimiento normativo
-- ============================================================

CREATE TABLE auditoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id),
  perfil_id UUID REFERENCES perfiles(id),
  accion TEXT NOT NULL,               -- 'crear', 'editar', 'eliminar', 'anular', 'login'
  tabla_afectada TEXT NOT NULL,
  registro_id UUID,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  ip_address INET,
  user_agent TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES — Performance
-- ============================================================

CREATE INDEX idx_movimientos_condominio ON movimientos_financieros(condominio_id);
CREATE INDEX idx_movimientos_tipo ON movimientos_financieros(tipo);
CREATE INDEX idx_movimientos_fecha ON movimientos_financieros(fecha DESC);
CREATE INDEX idx_movimientos_categoria_ing ON movimientos_financieros(categoria_ingreso) WHERE tipo = 'ingreso';
CREATE INDEX idx_movimientos_categoria_eg ON movimientos_financieros(categoria_egreso) WHERE tipo = 'egreso';
CREATE INDEX idx_movimientos_conciliado ON movimientos_financieros(conciliado) WHERE conciliado = FALSE;

CREATE INDEX idx_agenda_asamblea ON agenda_items(asamblea_id, numero);
CREATE INDEX idx_compromisos_condominio ON compromisos(condominio_id);
CREATE INDEX idx_compromisos_estado ON compromisos(estado);
CREATE INDEX idx_compromisos_asamblea ON compromisos(asamblea_id);
CREATE INDEX idx_adjuntos_asamblea ON adjuntos_asamblea(asamblea_id);
CREATE INDEX idx_rsvp_asamblea ON rsvp_asamblea(asamblea_id);
CREATE INDEX idx_auditoria_condominio ON auditoria(condominio_id, creado_en DESC);

-- ============================================================
-- ROW LEVEL SECURITY — Nuevas tablas
-- ============================================================

ALTER TABLE movimientos_financieros ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE compromisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjuntos_asamblea ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_asamblea ENABLE ROW LEVEL SECURITY;
ALTER TABLE compromisos_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE votaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE votos ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencia_asamblea ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuesto_anual ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS RLS: movimientos_financieros
-- Solo administrador, tesorero y superadmin pueden crear/editar
-- Copropietarios solo ven movimientos de su condominio
-- ============================================================

-- Lectura: cualquier miembro del condominio
CREATE POLICY "Miembros ven movimientos de su condominio"
  ON movimientos_financieros FOR SELECT
  USING (condominio_id = get_user_condominio());

-- Inserción: solo roles financieros
CREATE POLICY "Roles financieros registran movimientos"
  ON movimientos_financieros FOR INSERT
  WITH CHECK (
    condominio_id = get_user_condominio()
    AND get_user_role() IN ('superadmin', 'administrador', 'tesorero')
  );

-- Actualización: solo roles financieros (para anulaciones, conciliación)
CREATE POLICY "Roles financieros actualizan movimientos"
  ON movimientos_financieros FOR UPDATE
  USING (
    condominio_id = get_user_condominio()
    AND get_user_role() IN ('superadmin', 'administrador', 'tesorero')
  );

-- Eliminación: NADIE elimina movimientos (solo se anulan)
-- No se crea policy de DELETE → queda prohibido por RLS

-- ============================================================
-- POLÍTICAS RLS: compromisos
-- ============================================================

CREATE POLICY "Miembros ven compromisos de su condominio"
  ON compromisos FOR SELECT
  USING (condominio_id = get_user_condominio());

CREATE POLICY "Roles administrativos gestionan compromisos"
  ON compromisos FOR ALL
  USING (
    condominio_id = get_user_condominio()
    AND get_user_role() IN ('superadmin', 'administrador', 'secretario')
  );

-- ============================================================
-- POLÍTICAS RLS: agenda_items
-- ============================================================

CREATE POLICY "Miembros ven agenda de asambleas de su condominio"
  ON agenda_items FOR SELECT
  USING (
    asamblea_id IN (
      SELECT id FROM asambleas WHERE condominio_id = get_user_condominio()
    )
  );

CREATE POLICY "Roles administrativos gestionan agenda"
  ON agenda_items FOR ALL
  USING (
    asamblea_id IN (
      SELECT id FROM asambleas WHERE condominio_id = get_user_condominio()
    )
    AND get_user_role() IN ('superadmin', 'administrador', 'secretario')
  );

-- ============================================================
-- POLÍTICAS RLS: adjuntos_asamblea
-- ============================================================

CREATE POLICY "Miembros ven adjuntos de su condominio"
  ON adjuntos_asamblea FOR SELECT
  USING (
    asamblea_id IN (
      SELECT id FROM asambleas WHERE condominio_id = get_user_condominio()
    )
  );

CREATE POLICY "Roles administrativos gestionan adjuntos"
  ON adjuntos_asamblea FOR ALL
  USING (
    asamblea_id IN (
      SELECT id FROM asambleas WHERE condominio_id = get_user_condominio()
    )
    AND get_user_role() IN ('superadmin', 'administrador', 'secretario')
  );

-- ============================================================
-- POLÍTICAS RLS: rsvp_asamblea
-- ============================================================

CREATE POLICY "Miembros ven RSVP de su condominio"
  ON rsvp_asamblea FOR SELECT
  USING (
    asamblea_id IN (
      SELECT id FROM asambleas WHERE condominio_id = get_user_condominio()
    )
  );

CREATE POLICY "Miembros gestionan su propio RSVP"
  ON rsvp_asamblea FOR INSERT
  WITH CHECK (perfil_id = auth.uid());

CREATE POLICY "Miembros actualizan su propio RSVP"
  ON rsvp_asamblea FOR UPDATE
  USING (perfil_id = auth.uid());

-- ============================================================
-- POLÍTICAS RLS: compromisos_pago
-- ============================================================

CREATE POLICY "Copropietarios ven sus propios convenios"
  ON compromisos_pago FOR SELECT
  USING (
    perfil_id = auth.uid()
    OR (condominio_id = get_user_condominio()
        AND get_user_role() IN ('superadmin', 'administrador', 'tesorero'))
  );

CREATE POLICY "Roles financieros gestionan convenios"
  ON compromisos_pago FOR ALL
  USING (
    condominio_id = get_user_condominio()
    AND get_user_role() IN ('superadmin', 'administrador', 'tesorero')
  );

-- ============================================================
-- POLÍTICAS RLS: auditoria (solo lectura para admin/superadmin)
-- ============================================================

CREATE POLICY "Solo superadmin y administrador ven auditoría"
  ON auditoria FOR SELECT
  USING (
    (condominio_id = get_user_condominio() OR condominio_id IS NULL)
    AND get_user_role() IN ('superadmin', 'administrador')
  );

-- Inserción por funciones del sistema (SECURITY DEFINER)
CREATE POLICY "Sistema registra auditoría"
  ON auditoria FOR INSERT
  WITH CHECK (true);  -- Controlado por funciones SECURITY DEFINER

-- ============================================================
-- POLÍTICAS RLS: tablas de la migración 001 sin policies
-- ============================================================

-- condominios
CREATE POLICY "Miembros ven su condominio"
  ON condominios FOR SELECT
  USING (id = get_user_condominio());

CREATE POLICY "Superadmin gestiona condominios"
  ON condominios FOR ALL
  USING (get_user_role() = 'superadmin');

-- unidades
CREATE POLICY "Miembros ven unidades de su condominio"
  ON unidades FOR SELECT
  USING (condominio_id = get_user_condominio());

CREATE POLICY "Roles administrativos gestionan unidades"
  ON unidades FOR ALL
  USING (
    condominio_id = get_user_condominio()
    AND get_user_role() IN ('superadmin', 'administrador')
  );

-- documentos
CREATE POLICY "Miembros ven documentos de su condominio"
  ON documentos FOR SELECT
  USING (condominio_id = get_user_condominio());

CREATE POLICY "Roles administrativos gestionan documentos"
  ON documentos FOR ALL
  USING (
    condominio_id = get_user_condominio()
    AND get_user_role() IN ('superadmin', 'administrador', 'secretario')
  );

-- solicitudes_mantenimiento
CREATE POLICY "Miembros ven solicitudes de su condominio"
  ON solicitudes_mantenimiento FOR SELECT
  USING (condominio_id = get_user_condominio());

CREATE POLICY "Miembros crean solicitudes"
  ON solicitudes_mantenimiento FOR INSERT
  WITH CHECK (condominio_id = get_user_condominio());

CREATE POLICY "Roles administrativos gestionan solicitudes"
  ON solicitudes_mantenimiento FOR UPDATE
  USING (
    condominio_id = get_user_condominio()
    AND get_user_role() IN ('superadmin', 'administrador')
  );

-- proveedores (visibles para todos, editables por admin)
CREATE POLICY "Todos ven proveedores"
  ON proveedores FOR SELECT
  USING (true);

CREATE POLICY "Administradores gestionan proveedores"
  ON proveedores FOR ALL
  USING (get_user_role() IN ('superadmin', 'administrador'));

-- votaciones
CREATE POLICY "Miembros ven votaciones de su condominio"
  ON votaciones FOR SELECT
  USING (
    asamblea_id IN (
      SELECT id FROM asambleas WHERE condominio_id = get_user_condominio()
    )
  );

-- votos
CREATE POLICY "Miembros votan en asambleas de su condominio"
  ON votos FOR INSERT
  WITH CHECK (
    perfil_id = auth.uid()
    AND votacion_id IN (
      SELECT v.id FROM votaciones v
      JOIN asambleas a ON v.asamblea_id = a.id
      WHERE a.condominio_id = get_user_condominio()
    )
  );

CREATE POLICY "Miembros ven votos de su condominio"
  ON votos FOR SELECT
  USING (
    votacion_id IN (
      SELECT v.id FROM votaciones v
      JOIN asambleas a ON v.asamblea_id = a.id
      WHERE a.condominio_id = get_user_condominio()
    )
  );

-- asistencia_asamblea
CREATE POLICY "Miembros ven asistencia de su condominio"
  ON asistencia_asamblea FOR SELECT
  USING (
    asamblea_id IN (
      SELECT id FROM asambleas WHERE condominio_id = get_user_condominio()
    )
  );

-- presupuesto_anual
CREATE POLICY "Miembros ven presupuesto de su condominio"
  ON presupuesto_anual FOR SELECT
  USING (condominio_id = get_user_condominio());

-- ============================================================
-- TRIGGERS — Auto-actualización de timestamps nuevas tablas
-- ============================================================

CREATE TRIGGER trg_movimientos_updated
  BEFORE UPDATE ON movimientos_financieros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_compromisos_updated
  BEFORE UPDATE ON compromisos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_solicitudes_updated
  BEFORE UPDATE ON solicitudes_mantenimiento
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- FUNCIÓN: registrar movimiento financiero con auditoría
-- ============================================================

CREATE OR REPLACE FUNCTION registrar_movimiento(
  p_condominio_id UUID,
  p_tipo movimiento_tipo,
  p_categoria_ingreso ingreso_categoria DEFAULT NULL,
  p_categoria_egreso egreso_categoria DEFAULT NULL,
  p_descripcion TEXT DEFAULT '',
  p_monto DECIMAL DEFAULT 0,
  p_fecha DATE DEFAULT CURRENT_DATE,
  p_metodo metodo_pago DEFAULT 'transferencia',
  p_unidad_id UUID DEFAULT NULL,
  p_proveedor_id UUID DEFAULT NULL,
  p_notas TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO movimientos_financieros (
    condominio_id, tipo, categoria_ingreso, categoria_egreso,
    descripcion, monto, fecha, metodo,
    unidad_id, proveedor_id, notas, registrado_por
  ) VALUES (
    p_condominio_id, p_tipo, p_categoria_ingreso, p_categoria_egreso,
    p_descripcion, p_monto, p_fecha, p_metodo,
    p_unidad_id, p_proveedor_id, p_notas, auth.uid()
  )
  RETURNING id INTO v_id;

  -- Registrar en auditoría
  INSERT INTO auditoria (condominio_id, perfil_id, accion, tabla_afectada, registro_id, datos_nuevos)
  VALUES (
    p_condominio_id,
    auth.uid(),
    'crear',
    'movimientos_financieros',
    v_id,
    jsonb_build_object('tipo', p_tipo, 'monto', p_monto, 'descripcion', p_descripcion)
  );

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCIÓN: anular movimiento (nunca se eliminan)
-- ============================================================

CREATE OR REPLACE FUNCTION anular_movimiento(
  p_movimiento_id UUID,
  p_motivo TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_mov RECORD;
BEGIN
  SELECT * INTO v_mov FROM movimientos_financieros WHERE id = p_movimiento_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Movimiento no encontrado';
  END IF;

  IF v_mov.anulado THEN
    RAISE EXCEPTION 'Movimiento ya está anulado';
  END IF;

  UPDATE movimientos_financieros
  SET anulado = TRUE, anulado_en = NOW(), anulado_por = auth.uid(), motivo_anulacion = p_motivo
  WHERE id = p_movimiento_id;

  -- Registrar en auditoría
  INSERT INTO auditoria (condominio_id, perfil_id, accion, tabla_afectada, registro_id, datos_anteriores, datos_nuevos)
  VALUES (
    v_mov.condominio_id,
    auth.uid(),
    'anular',
    'movimientos_financieros',
    p_movimiento_id,
    jsonb_build_object('monto', v_mov.monto, 'tipo', v_mov.tipo),
    jsonb_build_object('motivo', p_motivo)
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCIÓN: resumen financiero del mes
-- ============================================================

CREATE OR REPLACE FUNCTION resumen_financiero_mes(
  p_condominio_id UUID,
  p_periodo TEXT DEFAULT TO_CHAR(CURRENT_DATE, 'YYYY-MM')
)
RETURNS TABLE (
  total_ingresos DECIMAL,
  total_egresos DECIMAL,
  balance DECIMAL,
  ingresos_por_categoria JSONB,
  egresos_por_categoria JSONB,
  total_movimientos BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN m.tipo = 'ingreso' AND NOT m.anulado THEN m.monto ELSE 0 END), 0) as total_ingresos,
    COALESCE(SUM(CASE WHEN m.tipo = 'egreso' AND NOT m.anulado THEN m.monto ELSE 0 END), 0) as total_egresos,
    COALESCE(SUM(CASE WHEN m.tipo = 'ingreso' AND NOT m.anulado THEN m.monto ELSE 0 END), 0)
    - COALESCE(SUM(CASE WHEN m.tipo = 'egreso' AND NOT m.anulado THEN m.monto ELSE 0 END), 0) as balance,
    (
      SELECT jsonb_object_agg(cat, total)
      FROM (
        SELECT m2.categoria_ingreso::TEXT as cat, SUM(m2.monto) as total
        FROM movimientos_financieros m2
        WHERE m2.condominio_id = p_condominio_id
          AND m2.tipo = 'ingreso'
          AND NOT m2.anulado
          AND TO_CHAR(m2.fecha, 'YYYY-MM') = p_periodo
        GROUP BY m2.categoria_ingreso
      ) sub
    ) as ingresos_por_categoria,
    (
      SELECT jsonb_object_agg(cat, total)
      FROM (
        SELECT m3.categoria_egreso::TEXT as cat, SUM(m3.monto) as total
        FROM movimientos_financieros m3
        WHERE m3.condominio_id = p_condominio_id
          AND m3.tipo = 'egreso'
          AND NOT m3.anulado
          AND TO_CHAR(m3.fecha, 'YYYY-MM') = p_periodo
        GROUP BY m3.categoria_egreso
      ) sub
    ) as egresos_por_categoria,
    COUNT(*) FILTER (WHERE NOT m.anulado) as total_movimientos
  FROM movimientos_financieros m
  WHERE m.condominio_id = p_condominio_id
    AND TO_CHAR(m.fecha, 'YYYY-MM') = p_periodo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCIÓN: vencer compromisos automáticamente
-- ============================================================

CREATE OR REPLACE FUNCTION vencer_compromisos_atrasados()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE compromisos
  SET estado = 'vencido', actualizado_en = NOW()
  WHERE estado = 'pendiente'
    AND fecha_compromiso < CURRENT_DATE;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- VISTAS — Consolidación rápida
-- ============================================================

CREATE OR REPLACE VIEW v_consolidacion_mensual AS
SELECT
  condominio_id,
  TO_CHAR(fecha, 'YYYY-MM') as periodo,
  SUM(CASE WHEN tipo = 'ingreso' AND NOT anulado THEN monto ELSE 0 END) as ingresos,
  SUM(CASE WHEN tipo = 'egreso' AND NOT anulado THEN monto ELSE 0 END) as egresos,
  SUM(CASE WHEN tipo = 'ingreso' AND NOT anulado THEN monto ELSE 0 END)
  - SUM(CASE WHEN tipo = 'egreso' AND NOT anulado THEN monto ELSE 0 END) as balance,
  COUNT(*) FILTER (WHERE NOT anulado) as total_movimientos
FROM movimientos_financieros
GROUP BY condominio_id, TO_CHAR(fecha, 'YYYY-MM');

CREATE OR REPLACE VIEW v_morosidad AS
SELECT
  u.id as unidad_id,
  u.condominio_id,
  u.numero as unidad,
  p.nombre_completo as propietario,
  p.telefono,
  u.saldo_pendiente,
  u.meses_morosidad,
  cp.descripcion as compromiso_pago,
  cp.activo as tiene_convenio
FROM unidades u
LEFT JOIN perfiles p ON u.propietario_id = p.id
LEFT JOIN compromisos_pago cp ON cp.unidad_id = u.id AND cp.activo = TRUE
WHERE u.meses_morosidad > 0;

-- ============================================================
-- STORAGE BUCKETS (ejecutar en SQL Editor de Supabase)
-- ============================================================

-- Bucket para documentos del condominio (actas, reglamentos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos',
  'documentos',
  FALSE,
  52428800,  -- 50MB máximo
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
) ON CONFLICT (id) DO NOTHING;

-- Bucket para comprobantes de pago
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'comprobantes',
  'comprobantes',
  FALSE,
  10485760,  -- 10MB máximo
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Bucket para fotos de solicitudes de mantención
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mantenimiento',
  'mantenimiento',
  FALSE,
  20971520,  -- 20MB máximo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
) ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage: documentos
CREATE POLICY "Miembros ven documentos de su condominio" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documentos'
    AND (storage.foldername(name))[1] = get_user_condominio()::TEXT
  );

CREATE POLICY "Roles admin suben documentos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documentos'
    AND (storage.foldername(name))[1] = get_user_condominio()::TEXT
    AND get_user_role() IN ('superadmin', 'administrador', 'secretario')
  );

-- Políticas de Storage: comprobantes
CREATE POLICY "Miembros ven comprobantes de su condominio" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'comprobantes'
    AND (storage.foldername(name))[1] = get_user_condominio()::TEXT
  );

CREATE POLICY "Roles financieros suben comprobantes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'comprobantes'
    AND (storage.foldername(name))[1] = get_user_condominio()::TEXT
    AND get_user_role() IN ('superadmin', 'administrador', 'tesorero')
  );

-- Políticas de Storage: mantenimiento
CREATE POLICY "Miembros ven fotos de mantenimiento" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'mantenimiento'
    AND (storage.foldername(name))[1] = get_user_condominio()::TEXT
  );

CREATE POLICY "Miembros suben fotos de mantenimiento" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'mantenimiento'
    AND (storage.foldername(name))[1] = get_user_condominio()::TEXT
  );
