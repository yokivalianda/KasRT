'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Komponen ini dipasang di root layout
// Tugasnya: dengarkan perubahan auth state dan redirect kalau session habis
export default function SessionRefresher() {
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.push('/login')
          router.refresh()
        }
        if (event === 'TOKEN_REFRESHED') {
          // Token berhasil diperbarui — refresh server components
          router.refresh()
        }
        if (event === 'SIGNED_IN') {
          router.refresh()
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [router])

  return null // Tidak render apapun
}
