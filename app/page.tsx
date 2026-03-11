import Link from 'next/link'
import { Building2, Brain, Shield, FileText, Users, TrendingUp } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-7 w-7 text-primary-600" />
              <span className="text-xl font-bold text-neutral-900 dark:text-white">
                CondoIA
              </span>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/login" className="btn-secondary text-sm">
                Iniciar sesión
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Comenzar gratis
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white dark:from-neutral-900 dark:to-neutral-950 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
              <Shield className="h-4 w-4" />
              100% compatible con Ley 21.442 de Copropiedad Inmobiliaria
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl lg:text-6xl">
              La administración de tu{' '}
              <span className="text-primary-600">condominio</span>, ahora con{' '}
              <span className="text-primary-600">inteligencia artificial</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
              Agentes IA especializados como Administrador, Tesorero y Secretario — que
              trabajan 24/7 para que tu comunidad funcione perfectamente y dentro de la ley.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary text-base px-6 py-3">
                Comenzar gratis — hasta 20 unidades
              </Link>
              <Link href="/login" className="btn-secondary text-base px-6 py-3">
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Agentes IA */}
      <section className="py-20 bg-white dark:bg-neutral-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">
              Tu equipo de gestión, potenciado por IA
            </h2>
            <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400">
              Tres agentes especializados basados en la Ley 21.442, disponibles 24/7
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: <Shield className="h-8 w-8 text-primary-600" />,
                title: 'Agente Administrador',
                subtitle: 'Art. 36-47 Ley 21.442',
                features: [
                  'Certificados de deuda electrónicos',
                  'Citaciones a asamblea',
                  'Cobranza extrajudicial',
                  'Representación en trámites',
                  'Custodia documental',
                ],
                color: 'primary',
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-green-600" />,
                title: 'Agente Tesorero',
                subtitle: 'Art. 22-35 Ley 21.442',
                features: [
                  'Informes financieros narrativos',
                  'Proyecciones de gastos',
                  'Alertas de morosidad',
                  'Análisis de presupuesto',
                  'Transparencia financiera total',
                ],
                color: 'green',
              },
              {
                icon: <FileText className="h-8 w-8 text-purple-600" />,
                title: 'Agente Secretario',
                subtitle: 'Art. 17-21 Ley 21.442',
                features: [
                  'Actas de asamblea automáticas',
                  'Comunicados a copropietarios',
                  'Transcripción de reuniones',
                  'Gestión de votaciones',
                  'Repositorio documental',
                ],
                color: 'purple',
              },
            ].map((agent) => (
              <div key={agent.title} className="card flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-700">
                    {agent.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">
                      {agent.title}
                    </h3>
                    <p className="text-sm text-neutral-500">{agent.subtitle}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {agent.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features destacadas del estudio de mercado */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-neutral-900 dark:text-white mb-14">
            Diseñado para superar a ComunidadFeliz, Kastor y Edifito
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <Brain />, title: 'IA como columna vertebral', desc: 'No un chatbot decorativo — IA que genera documentos legales, analiza finanzas y automatiza procesos.' },
              { icon: <Shield />, title: 'Firma electrónica (Ley 19.799)', desc: 'Actas, certificados y contratos firmados digitalmente con validez legal en Chile.' },
              { icon: <Users />, title: 'UX multi-generacional', desc: 'Tipografía grande, contraste AAA, botones de 48px. Usable desde los 12 hasta los 80+ años.' },
              { icon: <TrendingUp />, title: 'Transparencia financiera radical', desc: 'Dashboards en tiempo real para copropietarios. Cada peso trazable desde recaudación hasta pago.' },
              { icon: <Building2 />, title: 'Asambleas virtuales nativas', desc: 'Quórum automático, votación digital trazable, actas generadas por IA. Sin Zoom externo.' },
              { icon: <FileText />, title: 'API abierta + integraciones', desc: 'Integración con SII, bancos y ClaveÚnica. API REST para ecosistema de terceros.' },
            ].map((f) => (
              <div key={f.title} className="card">
                <div className="text-primary-600 mb-3">{f.icon}</div>
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">{f.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white dark:bg-neutral-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-neutral-900 dark:text-white mb-12">
            Planes transparentes
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { name: 'Comunidad', price: 'Gratis', units: 'Hasta 20 unidades', features: ['Comunicación básica', 'Gastos comunes', 'Certificado de deuda', 'Portal copropietarios'], cta: 'Empezar gratis', primary: false },
              { name: 'Profesional', price: 'Desde $35.000 CLP/mes', units: 'Sin límite de unidades', features: ['Todo el plan Comunidad', 'Agentes IA completos', 'Asambleas virtuales', 'Firma electrónica', 'Reportes financieros IA'], cta: 'Prueba 30 días gratis', primary: true },
              { name: 'Enterprise', price: 'Precio personalizado', units: '+50 comunidades', features: ['Todo el plan Profesional', 'API abierta', 'Integraciones SII/bancos', 'Soporte prioritario', 'Analytics avanzados'], cta: 'Contactar ventas', primary: false },
            ].map((plan) => (
              <div key={plan.name} className={`card flex flex-col ${plan.primary ? 'ring-2 ring-primary-500 relative' : ''}`}>
                {plan.primary && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Más popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-primary-600">{plan.price}</span>
                </div>
                <p className="text-sm text-neutral-500 mt-1">{plan.units}</p>
                <ul className="mt-4 space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`mt-6 ${plan.primary ? 'btn-primary' : 'btn-secondary'} w-full text-center`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Building2 className="h-5 w-5 text-primary-600" />
            <span className="font-semibold text-neutral-900 dark:text-white">CondoIA</span>
          </div>
          <p className="text-sm text-neutral-500">
            Plataforma certificada bajo Ley 21.442 de Copropiedad Inmobiliaria · Chile
          </p>
        </div>
      </footer>
    </div>
  )
}
