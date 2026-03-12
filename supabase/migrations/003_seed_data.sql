-- ============================================================
-- CondoIA — Migración 003: Datos Semilla para Desarrollo
-- NOTA: Solo para entorno de desarrollo/testing
-- En producción, eliminar este archivo o no ejecutar
-- ============================================================

-- ============================================================
-- 1. CONDOMINIO DE PRUEBA
-- ============================================================

INSERT INTO condominios (id, nombre, rut_comunidad, direccion, comuna, region, total_unidades, administrador_nombre, administrador_rut, administrador_vigencia, plan_tipo)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Condominio Parque Central',
  '77.123.456-7',
  'Av. Providencia 1234',
  'Providencia',
  'Metropolitana',
  42,
  'Claudio Rieutord',
  '12.345.678-9',
  '2027-12-31',
  'profesional'
);

-- ============================================================
-- 2. UNIDADES (departamentos del condominio)
-- ============================================================

INSERT INTO unidades (id, condominio_id, numero, piso, tipo, metros_cuadrados, coeficiente, saldo_pendiente, meses_morosidad) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '101', 1, 'departamento', 65.50, 0.02380952, 0, 0),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '103', 1, 'departamento', 72.00, 0.02619048, 0, 0),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '201', 2, 'departamento', 65.50, 0.02380952, 0, 0),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '301', 3, 'departamento', 68.00, 0.02476190, 0, 0),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '302', 3, 'departamento', 58.00, 0.02113095, 0, 0),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '401', 4, 'departamento', 75.00, 0.02728571, 0, 0),
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '402', 4, 'departamento', 60.00, 0.02183333, 110000, 2),
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', '501', 5, 'departamento', 80.00, 0.02914286, 0, 0),
  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', '503', 5, 'departamento', 55.00, 0.02000000, 55000, 1),
  ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', '602', 6, 'departamento', 70.00, 0.02547619, 0, 0),
  ('10000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', '702', 7, 'departamento', 85.00, 0.03095238, 0, 0),
  ('10000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', '801', 8, 'departamento', 90.00, 0.03276190, 0, 0),
  ('10000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', '903', 9, 'departamento', 62.00, 0.02257143, 0, 0),
  ('10000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', '1001', 10, 'departamento', 95.00, 0.03457143, 165000, 3);

-- ============================================================
-- 3. PROVEEDORES
-- ============================================================

INSERT INTO proveedores (id, nombre, rut, categoria, descripcion, telefono, email, calificacion_promedio, total_resenas, verificado, activo) VALUES
  ('30000000-0000-0000-0000-000000000001', 'Enel Distribución', '96.800.570-7', 'electricidad', 'Distribuidora eléctrica zona central', '+562 2680 6000', 'clientes@enel.cl', 3.80, 45, TRUE, TRUE),
  ('30000000-0000-0000-0000-000000000002', 'Aguas Andinas', '61.808.000-5', 'agua', 'Servicio de agua potable y alcantarillado RM', '+562 2688 1000', 'contacto@aguasandinas.cl', 3.50, 38, TRUE, TRUE),
  ('30000000-0000-0000-0000-000000000003', 'Metrogas', '96.722.460-K', 'gas', 'Gas natural por red', '+562 2337 3000', 'clientes@metrogas.cl', 4.00, 22, TRUE, TRUE),
  ('30000000-0000-0000-0000-000000000004', 'Securitas Chile', '96.670.840-3', 'seguridad', 'Servicios de vigilancia y seguridad privada', '+562 2757 7000', 'info@securitas.cl', 4.20, 15, TRUE, TRUE),
  ('30000000-0000-0000-0000-000000000005', 'Ascensores Schindler', '96.506.980-3', 'mantenimiento', 'Mantención y reparación de ascensores', '+562 2350 5000', 'chile@schindler.com', 4.50, 12, TRUE, TRUE),
  ('30000000-0000-0000-0000-000000000006', 'CleanPro Servicios', '76.543.210-1', 'limpieza', 'Aseo industrial y áreas comunes', '+569 9876 5432', 'contacto@cleanpro.cl', 4.30, 8, TRUE, TRUE),
  ('30000000-0000-0000-0000-000000000007', 'Jardines del Valle', '76.234.567-8', 'jardineria', 'Mantención de áreas verdes y jardinería', '+569 8765 4321', 'info@jardinesdelvalle.cl', 4.60, 10, TRUE, TRUE),
  ('30000000-0000-0000-0000-000000000008', 'Mapfre Seguros', '96.528.780-0', 'seguros', 'Seguros generales — póliza edificio', '+562 2460 0000', 'chile@mapfre.com', 4.10, 20, TRUE, TRUE);

-- ============================================================
-- 4. MOVIMIENTOS FINANCIEROS (Marzo 2026)
-- Nota: registrado_por se actualiza cuando hay usuarios reales
-- Usamos un UUID placeholder que se debe reemplazar
-- ============================================================

-- Primero creamos una función temporal para insertar sin auth.uid()
-- (En producción se usa la función registrar_movimiento con auth)

INSERT INTO movimientos_financieros (id, condominio_id, tipo, categoria_ingreso, categoria_egreso, descripcion, monto, fecha, metodo, registrado_por, proveedor_id, unidad_id) VALUES
  -- Ingresos: Cuotas de gastos comunes
  ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'ingreso', 'gasto_comun', NULL, 'Cuota mensual — Depto 401', 55000, '2026-03-12', 'transferencia', '00000000-0000-0000-0000-000000000099', NULL, '10000000-0000-0000-0000-000000000006'),
  ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'ingreso', 'gasto_comun', NULL, 'Cuota mensual — Depto 302', 55000, '2026-03-11', 'transferencia', '00000000-0000-0000-0000-000000000099', NULL, '10000000-0000-0000-0000-000000000005'),
  ('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'ingreso', 'gasto_comun', NULL, 'Cuota mensual — Depto 501', 55000, '2026-03-10', 'pago_linea', '00000000-0000-0000-0000-000000000099', NULL, '10000000-0000-0000-0000-000000000008'),
  ('50000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'ingreso', 'gasto_comun', NULL, 'Cuota mensual — Depto 201', 55000, '2026-03-10', 'transferencia', '00000000-0000-0000-0000-000000000099', NULL, '10000000-0000-0000-0000-000000000003'),
  ('50000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'ingreso', 'gasto_comun', NULL, 'Cuota mensual — Depto 602', 55000, '2026-03-07', 'efectivo', '00000000-0000-0000-0000-000000000099', NULL, '10000000-0000-0000-0000-000000000010'),
  ('50000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'ingreso', 'gasto_comun', NULL, 'Cuota mensual — Depto 103', 55000, '2026-03-06', 'transferencia', '00000000-0000-0000-0000-000000000099', NULL, '10000000-0000-0000-0000-000000000002'),
  ('50000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'ingreso', 'gasto_comun', NULL, 'Cuota mensual — Depto 301', 55000, '2026-03-05', 'transferencia', '00000000-0000-0000-0000-000000000099', NULL, '10000000-0000-0000-0000-000000000004'),
  ('50000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'ingreso', 'gasto_comun', NULL, 'Cuota mensual — Depto 702', 55000, '2026-03-04', 'transferencia', '00000000-0000-0000-0000-000000000099', NULL, '10000000-0000-0000-0000-000000000011'),
  ('50000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'ingreso', 'gasto_comun', NULL, 'Cuota mensual — Depto 801', 55000, '2026-03-02', 'transferencia', '00000000-0000-0000-0000-000000000099', NULL, '10000000-0000-0000-0000-000000000012'),
  ('50000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'ingreso', 'gasto_comun', NULL, 'Cuota mensual — Depto 903', 55000, '2026-03-01', 'pago_linea', '00000000-0000-0000-0000-000000000099', NULL, '10000000-0000-0000-0000-000000000013'),
  ('50000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'ingreso', 'gasto_comun', NULL, 'Cuota mensual — Depto 1001', 55000, '2026-03-01', 'transferencia', '00000000-0000-0000-0000-000000000099', NULL, '10000000-0000-0000-0000-000000000014'),

  -- Ingresos: Fondo de reserva
  ('50000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'ingreso', 'fondo_reserva', NULL, 'Aporte mensual fondo de reserva', 1200000, '2026-03-08', 'transferencia', '00000000-0000-0000-0000-000000000099', NULL, NULL),

  -- Ingresos: Multas
  ('50000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'ingreso', 'multa', NULL, 'Multa ruido excesivo — Depto 301', 80000, '2026-03-05', 'transferencia', '00000000-0000-0000-0000-000000000099', NULL, '10000000-0000-0000-0000-000000000004'),
  ('50000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'ingreso', 'multa', NULL, 'Multa estacionamiento indebido — Depto 503', 50000, '2026-03-01', 'transferencia', '00000000-0000-0000-0000-000000000099', NULL, '10000000-0000-0000-0000-000000000009'),

  -- Ingresos: Arriendos
  ('50000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', 'ingreso', 'arriendo', NULL, 'Arriendo salón multiuso — Evento privado', 120000, '2026-03-03', 'transferencia', '00000000-0000-0000-0000-000000000099', NULL, NULL),
  ('50000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000001', 'ingreso', 'arriendo', NULL, 'Arriendo estacionamiento visita — E5', 200000, '2026-03-01', 'efectivo', '00000000-0000-0000-0000-000000000099', NULL, NULL),

  -- Egresos: Servicios básicos
  ('50000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000001', 'egreso', NULL, 'servicios_basicos', 'Enel Distribución — Electricidad áreas comunes', 485000, '2026-03-12', 'debito_automatico', '00000000-0000-0000-0000-000000000099', '30000000-0000-0000-0000-000000000001', NULL),
  ('50000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000001', 'egreso', NULL, 'servicios_basicos', 'Aguas Andinas — Agua potable áreas comunes', 320000, '2026-03-11', 'transferencia', '00000000-0000-0000-0000-000000000099', '30000000-0000-0000-0000-000000000002', NULL),
  ('50000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000001', 'egreso', NULL, 'servicios_basicos', 'Metrogas — Gas áreas comunes', 195000, '2026-03-03', 'debito_automatico', '00000000-0000-0000-0000-000000000099', '30000000-0000-0000-0000-000000000003', NULL),

  -- Egresos: Mantenimiento
  ('50000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'egreso', NULL, 'mantenimiento', 'Ascensores Schindler — Mantención mensual', 380000, '2026-03-09', 'transferencia', '00000000-0000-0000-0000-000000000099', '30000000-0000-0000-0000-000000000005', NULL),
  ('50000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'egreso', NULL, 'mantenimiento', 'Jardines del Valle — Jardinería marzo', 180000, '2026-03-01', 'transferencia', '00000000-0000-0000-0000-000000000099', '30000000-0000-0000-0000-000000000007', NULL),

  -- Egresos: Seguridad
  ('50000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', 'egreso', NULL, 'seguridad', 'Securitas — Vigilancia marzo', 650000, '2026-03-07', 'transferencia', '00000000-0000-0000-0000-000000000099', '30000000-0000-0000-0000-000000000004', NULL),

  -- Egresos: Limpieza
  ('50000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000001', 'egreso', NULL, 'limpieza', 'CleanPro — Aseo áreas comunes marzo', 280000, '2026-03-06', 'transferencia', '00000000-0000-0000-0000-000000000099', '30000000-0000-0000-0000-000000000006', NULL),

  -- Egresos: Seguros
  ('50000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000001', 'egreso', NULL, 'seguros', 'Mapfre — Seguro edificio marzo', 580000, '2026-03-04', 'debito_automatico', '00000000-0000-0000-0000-000000000099', '30000000-0000-0000-0000-000000000008', NULL),

  -- Egresos: Administración
  ('50000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000001', 'egreso', NULL, 'administracion', 'Honorarios administración — Marzo', 450000, '2026-03-01', 'transferencia', '00000000-0000-0000-0000-000000000099', NULL, NULL),

  -- Egresos: Otros
  ('50000000-0000-0000-0000-000000000026', '00000000-0000-0000-0000-000000000001', 'egreso', NULL, 'otros', 'Insumos oficina conserje', 45000, '2026-03-01', 'efectivo', '00000000-0000-0000-0000-000000000099', NULL, NULL);

-- ============================================================
-- 5. ASAMBLEAS DE PRUEBA
-- ============================================================

INSERT INTO asambleas (id, condominio_id, tipo, estado, titulo, descripcion, fecha_convocatoria, quorum_requerido) VALUES
  ('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'extraordinaria', 'convocada', 'Asamblea Extraordinaria — Seguridad', 'Revisión del sistema de seguridad y cámaras del condominio', '2026-03-20 19:00:00-03', 50.00),
  ('60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'ordinaria', 'convocada', 'Asamblea Ordinaria Marzo 2026', 'Rendición de cuentas mensual y aprobación de gastos', '2026-03-25 18:30:00-03', 33.33),
  ('60000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'extraordinaria', 'finalizada', 'Asamblea Extraordinaria — Presupuesto 2026', 'Aprobación del presupuesto anual y fondo de reserva', '2026-02-15 19:00:00-03', 60.00),
  ('60000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'ordinaria', 'finalizada', 'Asamblea Ordinaria Febrero 2026', 'Rendición de cuentas febrero y planificación primer semestre', '2026-02-28 18:30:00-03', 33.33);

-- Agenda items para asambleas
INSERT INTO agenda_items (asamblea_id, numero, tema, descripcion, acuerdo, votos_favor, votos_contra, votos_abstencion) VALUES
  -- Asamblea 1 (convocada)
  ('60000000-0000-0000-0000-000000000001', 1, 'Presentación sistema cámaras IP', 'Evaluación de propuesta para renovar sistema de vigilancia', NULL, 0, 0, 0),
  ('60000000-0000-0000-0000-000000000001', 2, 'Contratación guardia 24/7', 'Análisis de propuestas de empresas de seguridad', NULL, 0, 0, 0),
  ('60000000-0000-0000-0000-000000000001', 3, 'Aprobación presupuesto seguridad', 'Definición del monto anual para seguridad', NULL, 0, 0, 0),

  -- Asamblea 2 (convocada)
  ('60000000-0000-0000-0000-000000000002', 1, 'Rendición de cuentas marzo', 'Presentación estado financiero del mes', NULL, 0, 0, 0),
  ('60000000-0000-0000-0000-000000000002', 2, 'Plan de mantenimiento Q2', 'Cronograma de mantenciones abril-junio', NULL, 0, 0, 0),

  -- Asamblea 3 (finalizada con acuerdos)
  ('60000000-0000-0000-0000-000000000003', 1, 'Presupuesto anual 2026', 'Aprobación del presupuesto operacional', 'Se aprueba presupuesto de $48.000.000 para 2026', 28, 3, 2),
  ('60000000-0000-0000-0000-000000000003', 2, 'Fondo de reserva', 'Definición del aporte mensual al fondo de reserva', 'Se fija aporte de $1.200.000 mensuales', 30, 1, 2),
  ('60000000-0000-0000-0000-000000000003', 3, 'Renovación contrato administración', 'Evaluación y renovación del contrato vigente', 'Se renueva contrato por 12 meses', 25, 5, 3),

  -- Asamblea 4 (finalizada)
  ('60000000-0000-0000-0000-000000000004', 1, 'Rendición de cuentas febrero', 'Estado financiero y balance', 'Se aprueba rendición por unanimidad', 32, 0, 1),
  ('60000000-0000-0000-0000-000000000004', 2, 'Mejoras áreas comunes', 'Propuesta de mejoras en quincho y piscina', 'Se aprueba presupuesto de mejoras por $2.500.000', 27, 4, 2);

-- ============================================================
-- 6. COMPROMISOS DE PRUEBA
-- ============================================================

INSERT INTO compromisos (condominio_id, asamblea_id, texto, responsable, fecha_compromiso, estado) VALUES
  ('00000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000003', 'Solicitar 3 cotizaciones para mejora sistema eléctrico áreas comunes', 'Claudio Rieutord', '2026-03-15', 'cumplido'),
  ('00000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000003', 'Publicar presupuesto aprobado en portal web del condominio', 'Secretario', '2026-02-28', 'cumplido'),
  ('00000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000004', 'Coordinar inicio de obras mejora quincho', 'Administración', '2026-04-01', 'pendiente'),
  ('00000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000004', 'Enviar circular informativa sobre cierre temporal piscina', 'Secretario', '2026-03-10', 'vencido'),
  ('00000000-0000-0000-0000-000000000001', NULL, 'Revisar póliza de seguro ante renovación anual', 'Tesorero', '2026-04-15', 'pendiente'),
  ('00000000-0000-0000-0000-000000000001', NULL, 'Gestionar cobro judicial a depto 1001 (3 meses mora)', 'Administración', '2026-03-20', 'en_progreso');

-- ============================================================
-- 7. COMPROMISOS DE PAGO (morosos)
-- ============================================================

INSERT INTO compromisos_pago (condominio_id, unidad_id, perfil_id, deuda_total, cuotas, monto_cuota, fecha_inicio, fecha_fin, descripcion, activo) VALUES
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000099', 110000, 2, 55000, '2026-04-01', '2026-05-26', 'Pago parcial de $60.000 el 5 de abril, saldo en mayo', TRUE),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000099', 165000, 3, 55000, '2026-04-01', '2026-06-26', 'Convenio de pago en 3 cuotas a partir de abril', TRUE);

-- ============================================================
-- NOTA IMPORTANTE:
-- El UUID '00000000-0000-0000-0000-000000000099' es un placeholder
-- para el campo registrado_por / perfil_id.
-- Debe crearse un usuario "sistema" o reemplazarse cuando se
-- registren los usuarios reales via Supabase Auth.
--
-- Para que el seed funcione, primero crear un perfil placeholder:
-- ============================================================

-- Necesitamos insertar un perfil placeholder ANTES de los movimientos
-- Esto requiere que exista un usuario en auth.users
-- En desarrollo, se puede crear manualmente desde el Dashboard de Supabase
