import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC = ['/login', '/auth']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const { pathname } = req.nextUrl

  const isPublic = PUBLIC.some(p => pathname.startsWith(p))

  // Belum login → login
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Root redirect
  if (pathname === '/') {
    return NextResponse.redirect(new URL(session ? '/dashboard' : '/login', req.url))
  }

  // Sudah login + buka login → dashboard
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Cek onboarding — skip jika sudah di /onboarding atau /api
  if (session && !pathname.startsWith('/onboarding') && !isPublic) {
    const { count } = await supabase
      .from('neighborhoods')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', session.user.id)

    if ((count ?? 0) === 0) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|json|txt|xml)$).*)'],
}
