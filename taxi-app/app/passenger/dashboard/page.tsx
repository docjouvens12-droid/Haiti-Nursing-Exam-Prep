'use client'

import { useEffect, useState } from 'react'
import HomePage from '../../page'
import { supabase } from '../../../lib/supabase'

export default function PassengerDashboardPage() {
  const [ready, setReady] = useState(false)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    let active = true

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!active) return

      if (data.session?.user) {
        setHasSession(true)
        setReady(true)
        return
      }

      setReady(true)
      window.location.replace('/passenger/login')
    }

    void loadSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      if (session?.user) {
        setHasSession(true)
        setReady(true)
      }
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  if (!ready || !hasSession) {
    return (
      <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#eef4f7', color: '#536579', fontFamily: 'system-ui, sans-serif', fontWeight: 800 }}>
        Connexion en cours…
      </main>
    )
  }

  return <HomePage />
}
