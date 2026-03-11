import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware de autenticación y control de acceso.
 * Protege rutas del dashboard y redirige usuarios no autenticados.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refrescar sesión (importante para no expirar tokens)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Rutas públicas — no requieren autenticación
  const publicPaths = ['/login', '/register', '/olvide-contrasena', '/']
  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p))

  // Si no está autenticado y trata de acceder a ruta protegida
  if (!user && !isPublicPath) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si está autenticado y trata de acceder a login/register
  if (user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Control de acceso por rol para rutas específicas
  if (user && pathname.startsWith('/dashboard')) {
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol, condominio_id')
      .eq('id', user.id)
      .single()

    if (perfil) {
      // Rutas solo para administrador
      if (pathname.startsWith('/dashboard/admin') && perfil.rol !== 'administrador' && perfil.rol !== 'superadmin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      // Rutas solo para tesorero o administrador
      if (pathname.startsWith('/dashboard/finanzas') &&
          !['administrador', 'tesorero', 'superadmin'].includes(perfil.rol)) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      // Si aún no tiene condominio asignado
      if (!perfil.condominio_id && !pathname.startsWith('/dashboard/onboarding') && perfil.rol !== 'superadmin') {
        return NextResponse.redirect(new URL('/dashboard/onboarding', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Excluir archivos estáticos y API de Supabase auth
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
