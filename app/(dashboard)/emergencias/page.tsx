import { ShieldAlert } from 'lucide-react'
import EmergenciasClient from '@/components/emergencias/EmergenciasClient'

export const metadata = { title: 'Emergencias y Alertas' }

export default function EmergenciasPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-red-500" />
          Emergencias y Alertas
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-0.5">
          Alertas comunitarias, sismos en Chile y protocolos de emergencia
        </p>
      </div>

      <EmergenciasClient />
    </div>
  )
}
