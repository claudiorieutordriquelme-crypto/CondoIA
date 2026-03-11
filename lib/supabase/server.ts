import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cliente Supabase para uso en Server Components, Server Actions y Route Handlers.
 * Gestiona automáticamente el refresco de tokens de sesión.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server Component — las cookies se manejan en middleware
          }
        },
      },
    }
  )
}

/**
 * Cliente con service role para operaciones administrativas del sistema.
 * NUNCA exponer al cliente — solo usar en API routes server-side.
 */
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { getAll: () => [], setAll: () => {} },
    }
  )
}
