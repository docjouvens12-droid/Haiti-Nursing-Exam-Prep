'use client'

import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import HomePage from '../../page'
import { supabase } from '../../../lib/supabase'

export default function PassengerDashboardPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    async function loadSession() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (!active) return

        if (error || !data.session?.user) {
          setReady(true)
          window.location.replace('/passenger/login')
          return
        }

        setSession(data.session)
        setReady(true)
      } catch {
        if (!active) return
        setReady(true)
        window.location.replace('/passenger/login')
      }
    }

    void loadSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      if (nextSession?.user) {
        setSession(nextSession)
        setReady(true)
      }
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  if (!ready || !session?.user) return <LoadingScreen />

  return <HomePage />
}

function LoadingScreen() {
  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#eef4f7', color: '#536579', fontFamily: 'system-ui, sans-serif', fontWeight: 800 }}>
      Connexion en cours…
    </main>
  )
}
