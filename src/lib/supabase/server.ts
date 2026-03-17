import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Dipakai di Server Components dan Route Handlers
export function createServer() {
  return createServerComponentClient({ cookies })
}
