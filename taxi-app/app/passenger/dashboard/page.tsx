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

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!active) return

      if (!data.session?.user) {
        setReady(true)
        window.location.replace('/passenger/login')
        return
      }

      // Re-prime the exact session before mounting HomePage. This avoids the
      // second auth check inside HomePage seeing a transient null user on
      // Safari immediately after navigation from the passenger login page.
      const { data: primed, error } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      })

      if (!active) return

      if (error || !primed.session?.user) {
        setReady(true)
        window.location.replace('/passenger/login')
        return
      }

      setSession(primed.session)
      window.setTimeout(() => {
        if (active) setReady(true)
      }, 120)
    }

    void loadSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active || !nextSession?.user) return
      setSession(nextSession)
      setReady(true)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  if (!ready || !session?.user) {
    return (
      <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#eef4f7', color: '#536579', fontFamily: 'system-ui, sans-serif', fontWeight: 800 }}>
        Connexion en cours…
      </main>
    )
  }

  return <HomePage />
}
