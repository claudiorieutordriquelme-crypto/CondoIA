import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente Supabase para uso en componentes del lado del cliente (browser).
 * Usar este cliente en Client Components ('use client').
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
