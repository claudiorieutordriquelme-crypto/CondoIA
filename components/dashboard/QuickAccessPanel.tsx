'use client'

import { useState } from 'react'
import { DoorOpen, Video, Wallet, PhoneCall, X, CheckCircle } from 'lucide-react'

// ============================================================
// QuickAccessPanel — Acciones rápidas del residente
// Apertura portón, cámaras y pago rápido
// ============================================================

const PORTON_TELEFONO = '+56988156948'

type ModalType = 'porton' | 'camaras' | 'pago' | null

export default function QuickAccessPanel() {
  const [modal, setModal] = useState<ModalType>(null)
  const [pagoEstado, setPagoEstado] = useState<'idle' | 'procesando' | 'exito'>('idle')

  const handlePagoFicticio = () => {
    setPagoEstado('procesando')
    setTimeout(() => {
      setPagoEstado('exito')
      setTimeout(() => {
        setPagoEstado('idle')
        setModal(null)
      }, 2500)
    }, 2000)
  }

  const acciones = [
    {
      id: 'porton' as const,
      label: 'Abrir Portón',
      desc: 'Llamar al sistema de apertura',
      icon: <DoorOpen className="h-6 w-6" />,
      color: 'bg-amber-500 hover:bg-amber-600',
      ringColor: 'ring-amber-300',
    },
    {
      id: 'camaras' as const,
      label: 'Cámaras',
      desc: 'Ver cámaras del condominio',
      icon: <Video className="h-6 w-6" />,
      color: 'bg-slate-600 hover:bg-slate-700',
      ringColor: 'ring-slate-300',
    },
    {
      id: 'pago' as const,
      label: 'Pagar Gasto',
      desc: 'Pago rápido de gastos comunes',
      icon: <Wallet className="h-6 w-6" />,
      color: 'bg-green-600 hover:bg-green-700',
      ringColor: 'ring-green-300',
    },
  ]

  return (
    <>
      {/* Botones de acceso rápido */}
      <div className="card">
        <h2 className="font-semibold text-neutral-900 dark:text-white mb-3">
          Acceso Rápido
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {acciones.map((accion) => (
            <button
              key={accion.id}
              onClick={() => setModal(accion.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl text-white transition-all
                ${accion.color} active:scale-95 focus:outline-none focus:ring-2 ${accion.ringColor}
                min-h-[88px] touch-manipulation`}
              style={{ minHeight: '88px' }}
            >
              {accion.icon}
              <span className="text-sm font-medium leading-tight text-center">{accion.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal Portón */}
      {modal === 'porton' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModal(null)}>
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Apertura de Portón</h3>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700">
                <X className="h-5 w-5 text-neutral-400" />
              </button>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <DoorOpen className="h-8 w-8 text-amber-600" />
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Se realizará una llamada al sistema de apertura remota del portón del condominio.
              </p>
              <a
                href={`tel:${PORTON_TELEFONO}`}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-amber-500 hover:bg-amber-600
                  text-white font-semibold rounded-xl transition-colors active:scale-95 touch-manipulation"
                style={{ minHeight: '48px' }}
              >
                <PhoneCall className="h-5 w-5" />
                Llamar para abrir
              </a>
              <p className="text-xs text-neutral-400">
                Número: {PORTON_TELEFONO}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cámaras */}
      {modal === 'camaras' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModal(null)}>
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Cámaras de Seguridad</h3>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700">
                <X className="h-5 w-5 text-neutral-400" />
              </button>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center">
                <Video className="h-8 w-8 text-slate-600" />
              </div>

              {/* Placeholder de cámaras */}
              <div className="grid grid-cols-2 gap-2">
                {['Entrada Principal', 'Estacionamiento', 'Piscina', 'Hall Acceso'].map((cam) => (
                  <div key={cam} className="aspect-video bg-neutral-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-300/50 to-neutral-400/50 dark:from-neutral-600/50 dark:to-neutral-700/50" />
                    <Video className="h-6 w-6 text-neutral-400 dark:text-neutral-500 relative z-10" />
                    <span className="absolute bottom-1 left-1.5 text-[10px] font-medium text-neutral-500 dark:text-neutral-400 z-10">
                      {cam}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-neutral-400">
                Próximamente — Integración con sistema CCTV del condominio
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pago */}
      {modal === 'pago' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModal(null)}>
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Pago de Gastos Comunes</h3>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700">
                <X className="h-5 w-5 text-neutral-400" />
              </button>
            </div>

            {pagoEstado === 'exito' ? (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-bounce">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-green-700 dark:text-green-400">Pago Exitoso</p>
                  <p className="text-sm text-neutral-500 mt-1">Comprobante N° {Math.random().toString(36).slice(2, 10).toUpperCase()}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Período</span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Gasto común</span>
                    <span className="font-medium text-neutral-900 dark:text-white">$85.430</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Fondo de reserva</span>
                    <span className="font-medium text-neutral-900 dark:text-white">$12.500</span>
                  </div>
                  <hr className="border-neutral-200 dark:border-neutral-700" />
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-neutral-700 dark:text-neutral-300">Total</span>
                    <span className="text-neutral-900 dark:text-white">$97.930</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Método de pago</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['WebPay', 'Khipu', 'Transfer.'].map((metodo) => (
                      <button
                        key={metodo}
                        className="py-2 px-3 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-600
                          hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors
                          focus:outline-none focus:ring-2 focus:ring-green-300 touch-manipulation"
                        style={{ minHeight: '44px' }}
                      >
                        {metodo}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handlePagoFicticio}
                  disabled={pagoEstado === 'procesando'}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-green-600 hover:bg-green-700
                    disabled:bg-green-400 text-white font-semibold rounded-xl transition-colors
                    active:scale-95 touch-manipulation"
                  style={{ minHeight: '48px' }}
                >
                  {pagoEstado === 'procesando' ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-5 w-5" />
                      Pagar $97.930
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-neutral-400">
                  Demo — Pago ficticio sin transacción real
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
