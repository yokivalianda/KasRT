import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC = ['/login', '/auth']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // getSession() membaca JWT dari cookie — TIDAK hit network ke Supabase
  // Jauh lebih cepat dari getUser() yang selalu verify ke server
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl
  const isPublic = PUBLIC.some(p => pathname.startsWith(p))

  // Belum login → ke /login
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Root redirect
  if (pathname === '/') {
    return NextResponse.redirect(new URL(session ? '/dashboard' : '/login', req.url))
  }

  // Sudah login + buka /login → dashboard
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // TIDAK ada DB query di sini — onboarding check dipindah ke halaman
  // Middleware hanya cek session (dari cookie, sangat cepat)

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|json|txt|xml)$).*)',
  ],
}
