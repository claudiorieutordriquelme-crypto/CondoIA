import { BookOpen, Scale, Building2, DollarSign, Users } from 'lucide-react'
import { ReglamentoAccordion } from '@/components/reglamento/ReglamentoAccordion'

export const metadata = { title: 'Reglamento' }

const SECCIONES = [
  {
    id: 'titulo-1',
    titulo: 'Título I: Del dominio de los condominios',
    articulos: [
      {
        numero: '1-3',
        titulo: 'Concepto y formación del condominio',
        resumen: 'Define condominio como propiedad común de dos o más personas sobre bienes divisibles o no divisibles. Regula su formación y registro.',
      },
      {
        numero: '4-7',
        titulo: 'Derechos y obligaciones de copropietarios',
        resumen: 'Establece derechos de uso y goce de partes privativas, participación en bienes comunes y obligaciones de mantención.',
      },
      {
        numero: '8-11',
        titulo: 'Reforma y extinción del condominio',
        resumen: 'Regula cambios en estructura del condominio, fusiones y terminación de la propiedad común.',
      },
      {
        numero: '12-16',
        titulo: 'Inscripción y registro',
        resumen: 'Requisitos de inscripción en el Conservador de Bienes Raíces. CondoIA mantiene registro actualizado de propiedades.',
        condoiaHelp: true,
      },
    ],
    icon: <Building2 className="h-5 w-5" />,
    color: 'text-blue-600',
  },
  {
    id: 'titulo-2',
    titulo: 'Título II: De la administración',
    articulos: [
      {
        numero: '17-19',
        titulo: 'Gobierno y asambleas',
        resumen: 'Asambleas ordinarias y extraordinarias, quórum, votaciones, actas. CondoIA gestiona ciclo completo de asambleas.',
        condoiaHelp: true,
      },
      {
        numero: '20-21',
        titulo: 'Toma de decisiones',
        resumen: 'Votación simple y calificada. Supramayorías para reformas estructurales.',
      },
      {
        numero: '22-27',
        titulo: 'Gastos comunes y extraordinarios',
        resumen: 'Presupuesto anual, cuotas, fondos de reserva. CondoIA automatiza cálculos y cobro de gastos comunes.',
        condoiaHelp: true,
      },
      {
        numero: '28-35',
        titulo: 'Administración financiera',
        resumen: 'Recaudación, inversión de fondos, informes financieros, auditoría. CondoIA genera reportes automáticos.',
        condoiaHelp: true,
      },
    ],
    icon: <Scale className="h-5 w-5" />,
    color: 'text-purple-600',
  },
  {
    id: 'titulo-3',
    titulo: 'Título III: Del administrador',
    articulos: [
      {
        numero: '36-38',
        titulo: 'Designación y requisitos',
        resumen: 'Elegido por asamblea, puede ser copropietario o tercero. Requisitos de idoneidad y actualización de data.',
      },
      {
        numero: '39-42',
        titulo: 'Atribuciones y deberes',
        resumen: 'Ejecutor de decisiones asamblearias, debe llevar libros, emitir citaciones, reportes mensuales.',
      },
      {
        numero: '43-45',
        titulo: 'Responsabilidad y cese',
        resumen: 'Responsable por incumplimiento. Puede ser removido por asamblea en cualquier momento.',
      },
      {
        numero: '46-47',
        titulo: 'Delegación de funciones',
        resumen: 'Puede delegar tareas operativas. CondoIA asiste con certificados, comunicados y documentación.',
        condoiaHelp: true,
      },
    ],
    icon: <Users className="h-5 w-5" />,
    color: 'text-green-600',
  },
  {
    id: 'titulo-4',
    titulo: 'Título IV: Disposiciones financieras',
    articulos: [
      {
        numero: '48-51',
        titulo: 'Gastos comunes',
        resumen: 'Distribución proporcional al coeficiente. CondoIA calcula automáticamente por unidad.',
        condoiaHelp: true,
      },
      {
        numero: '52-54',
        titulo: 'Fondos de reserva',
        resumen: 'Obligatorio ahorrar 20% de ingresos para mantención. CondoIA proyecta necesidades a 10 años.',
        condoiaHelp: true,
      },
      {
        numero: '55-57',
        titulo: 'Cobranza y sanciones',
        resumen: 'Intereses de mora, procedimientos de cobranza. CondoIA automatiza notificaciones y seguimiento.',
        condoiaHelp: true,
      },
    ],
    icon: <DollarSign className="h-5 w-5" />,
    color: 'text-amber-600',
  },
]

export default function ReglamentoPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-primary-600" />
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Ley 21.442 — Copropiedad Inmobiliaria
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
            Guía legal interactiva de la normativa de condominios en Chile
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="card bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <BookOpen className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-2">Acerca de esta guía</p>
            <p>
              La Ley 21.442 regula los condominios inmobiliarios en Chile. CondoIA integra todos estos
              requisitos en la plataforma para ayudarte a cumplir automáticamente con la normativa.
            </p>
          </div>
        </div>
      </div>

      {/* Secciones */}
      <div className="space-y-4">
        {SECCIONES.map((seccion) => (
          <ReglamentoAccordion key={seccion.id} seccion={seccion} />
        ))}
      </div>

      {/* Footer */}
      <div className="card bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          <strong>Nota legal:</strong> Esta guía es un resumen educativo de la Ley 21.442. Para consultas
          legales específicas, consulta con un abogado especializado. CondoIA es una herramienta de apoyo
          que facilita el cumplimiento normativo.
        </p>
      </div>
    </div>
  )
}
