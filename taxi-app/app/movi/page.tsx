'use client'

import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function MoviEntryPage() {
  useEffect(() => {
    let active = true

    async function routeSession() {
      try {
        const { data } = await supabase.auth.getSession()
        if (!active) return
        if (data.session?.user) window.location.replace('/')
      } catch {
        // The global MOVI entry handles signed-out and auth-error states.
      }
    }

    void routeSession()
    return () => { active = false }
  }, [])

  return (
    <main style={{ minHeight: '100dvh', background: '#f4f8f6', display: 'grid', placeItems: 'center' }}>
      <div style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: 900, color: '#0f705a', letterSpacing: '.08em' }}>MOVI</div>
    </main>
  )
}
