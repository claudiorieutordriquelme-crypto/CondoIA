import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility para combinar clases Tailwind sin conflictos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea montos en pesos chilenos
 */
export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formatea fecha en español chileno
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(new Date(date))
}

/**
 * Formatea período YYYY-MM a nombre legible
 */
export function formatPeriodo(periodo: string): string {
  const [year, month] = periodo.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(date)
}

/**
 * Calcula el porcentaje de forma segura
 */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Trunca texto con ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Debounce para búsquedas y inputs
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Genera el período actual en formato YYYY-MM
 */
export function getCurrentPeriodo(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Calcula interés por mora (Ley 21.442 Art. 27)
 * Tasa: interés corriente para operaciones reajustables según CMF
 */
export function calcularInteresMora(
  montoPrincipal: number,
  diasMora: number,
  tasaMensual = 0.015 // 1.5% mensual por defecto — ajustar según CMF
): number {
  const tasaDiaria = tasaMensual / 30
  return montoPrincipal * tasaDiaria * diasMora
}
