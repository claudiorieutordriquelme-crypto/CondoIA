import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'CondoIA — Administración Inteligente de Condominios',
    template: '%s | CondoIA',
  },
  description:
    'Plataforma de administración de condominios con inteligencia artificial. Cumplimiento nativo Ley 21.442 Chile.',
  keywords: ['condominios', 'administración', 'Chile', 'Ley 21.442', 'gastos comunes', 'IA'],
  authors: [{ name: 'CondoIA' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://condoia.cl'),
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    siteName: 'CondoIA',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
