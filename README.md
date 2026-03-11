# CondoIA — Plataforma de Administración de Condominios con IA

> **Primera plataforma chilena de administración de condominios con IA nativa y cumplimiento 100% Ley 21.442 de Copropiedad Inmobiliaria.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/claudiorieutordriquelme-crypto/condoia)

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15 App Router + TypeScript + Tailwind CSS |
| Backend | Next.js API Routes (serverless) |
| Base de datos | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password + OAuth) |
| IA Agentes | Anthropic Claude API (claude-opus-4-6) |
| Storage | Supabase Storage (documentos, actas) |
| Deploy | Vercel |

---

## Características Principales

### 🤖 Tres Agentes IA (Ley 21.442)

| Agente | Base legal | Capacidades |
|--------|-----------|-------------|
| **Administrador Virtual** | Art. 36-47 | Certificados deuda, citaciones asamblea, cobranza, trámites |
| **Tesorero Virtual** | Art. 22-35 | Informes financieros, morosidad, presupuesto, proyecciones |
| **Secretario Virtual** | Art. 17-21 | Actas, comunicados, transcripción reuniones, votaciones |

### 📋 Funcionalidades Core

- Gestión de gastos comunes con emisión masiva por período
- Portal copropietarios con historial de pagos y documentos
- Asambleas virtuales con quórum automático (Art. 18)
- Votaciones digitales con trazabilidad
- Alertas de morosidad con cálculo de intereses (Art. 27)
- Repositorio documental con firma electrónica (Ley 19.799)
- Control de acceso por rol (administrador/tesorero/secretario/copropietario)
- Dashboard financiero en tiempo real
- Marketplace de proveedores verificados

### ⚖️ Validez Legal del Administrador Virtual

El Agente Administrador Virtual opera como **asistente del administrador humano certificado**, quien mantiene la personalidad jurídica y representación legal de la comunidad según la Ley 21.442.

Los documentos generados por la IA son **borradores que requieren revisión y firma** del administrador certificado registrado en la plataforma. La firma electrónica simple del administrador certificado tiene validez legal bajo la **Ley 19.799 de Firma Electrónica de Chile**.

---

## Despliegue paso a paso

### Paso 1: Configurar Supabase

1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear nuevo proyecto: nombre `condoia-prod`, región `South America (São Paulo)`
3. Ir a **SQL Editor** y ejecutar el archivo de migración:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
4. En **Authentication > Providers**: activar Email/Password
5. En **Authentication > URL Configuration**:
   - Site URL: `https://condoia.vercel.app`
   - Redirect URLs: `https://condoia.vercel.app/auth/callback`
6. Copiar de **Settings > API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Paso 2: Obtener API Key de Anthropic

1. Ir a [console.anthropic.com](https://console.anthropic.com)
2. **API Keys > Create Key**
3. Copiar la key: `sk-ant-api03-...`

### Paso 3: Subir a GitHub

```bash
# En la carpeta condoia/
git init
git add .
git commit -m "feat: CondoIA v1.0 — Plataforma administración condominios con IA"
git branch -M main
git remote add origin https://github.com/claudiorieutordriquelme-crypto/condoia.git
git push -u origin main
```

> ⚠️ **Nota:** Verifica que tu usuario GitHub sea exactamente `claudiorieutordriquelme-crypto` (sin puntos si GitHub no los admite). Puedes ajustar la URL del remote.

### Paso 4: Desplegar en Vercel

1. Ir a [vercel.com](https://vercel.com) > **New Project**
2. Importar repositorio `condoia` desde GitHub
3. Framework: **Next.js** (detectado automáticamente)
4. En **Environment Variables**, agregar:

```
NEXT_PUBLIC_SUPABASE_URL          = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY     = eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY         = eyJhbGciOiJIUzI1NiIs...
ANTHROPIC_API_KEY                 = sk-ant-api03-...
NEXT_PUBLIC_APP_URL               = https://condoia.vercel.app
NEXT_PUBLIC_APP_NAME              = CondoIA
NEXTAUTH_SECRET                   = [genera con: openssl rand -base64 32]
```

5. Click **Deploy**

### Paso 5: Configurar dominio (opcional)

En Vercel > Project Settings > Domains:
- Agregar `condoia.cl` o tu dominio
- Actualizar Site URL en Supabase con el dominio final

---

## Desarrollo local

```bash
# Clonar
git clone https://github.com/claudiorieutordriquelme-crypto/condoia.git
cd condoia

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales

# Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Roles del sistema

| Rol | Descripción | Permisos |
|-----|-------------|---------|
| `superadmin` | Admin de la plataforma CondoIA | Todo |
| `administrador` | Administrador certificado Ley 21.442 | Gestión completa del condominio + agentes IA |
| `tesorero` | Tesorero del comité | Finanzas + Agente Tesorero IA |
| `secretario` | Secretario del comité | Documentos + Asambleas + Agente Secretario IA |
| `copropietario` | Propietario de unidad | Portal personal, gastos, documentos públicos |
| `arrendatario` | Arrendatario de unidad | Vista limitada (gastos propios, avisos) |

---

## Estructura del proyecto

```
condoia/
├── app/
│   ├── (auth)/         # Login, Register
│   ├── (dashboard)/    # Panel principal por rol
│   │   ├── dashboard/  # Resumen y stats
│   │   ├── agentes/    # Chat con agentes IA
│   │   ├── asambleas/  # Gestión de asambleas
│   │   ├── gastos/     # Gastos comunes
│   │   └── ...
│   ├── api/
│   │   ├── agents/     # API routes agentes IA
│   │   ├── gastos/     # CRUD gastos comunes
│   │   └── asambleas/  # CRUD asambleas
│   └── page.tsx        # Landing page
├── components/
│   ├── layout/         # Sidebar, Topbar
│   └── ...
├── lib/
│   ├── agents/         # Lógica agentes IA (Claude)
│   ├── supabase/       # Clientes Supabase
│   └── utils.ts        # Utilidades
├── types/              # TypeScript types
├── supabase/
│   └── migrations/     # SQL migrations
├── middleware.ts        # Auth + RBAC
└── vercel.json
```

---

## Roadmap

**v1.0 (Actual)**
- [x] Agentes IA: Administrador, Tesorero, Secretario
- [x] Gestión de gastos comunes
- [x] Asambleas virtuales (Ley 21.442)
- [x] Dashboard financiero
- [x] Control de acceso por rol
- [x] Portal copropietarios

**v1.1**
- [ ] Integración WebPay/Transbank para pagos online
- [ ] Notificaciones por email y WhatsApp
- [ ] Firma electrónica avanzada (Ley 19.799)
- [ ] Generación automática de actas con IA

**v1.2**
- [ ] Integración SII para facturación electrónica
- [ ] App móvil (React Native)
- [ ] API pública documentada (Swagger)
- [ ] Marketplace de proveedores verificados

---

## Licencia

Propiedad de Claudio Rieutord / Entel. Todos los derechos reservados.

---

*Desarrollado con IA nativa para el mercado chileno de condominios. Cumplimiento nativo Ley 21.442 de Copropiedad Inmobiliaria.*
