import { createServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PageTransition from '@/components/PageTransition'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sb = createServer()
  const { data: { session } } = await sb.auth.getSession()

  if (!session) redirect('/login')

  const { count } = await sb
    .from('neighborhoods')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', session.user.id)

  if ((count ?? 0) === 0) redirect('/onboarding')

  return <PageTransition>{children}</PageTransition>
}
