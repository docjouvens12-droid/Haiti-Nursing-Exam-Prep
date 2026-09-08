'use client'

import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import HomePage from '../../page'
import { supabase } from '../../../lib/supabase'

export default function PassengerDashboardPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  useEffect(() => {
    let active = true

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!active) return

      if (!data.session?.user) {
        window.location.replace('/passenger/login')
        return
      }

      setSession(data.session)
      setReady(true)
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

  // HomePage has its own legacy auth bootstrap. Mount it hidden briefly so its
  // getUser()/auth listener can recover the already-persisted Supabase session,
  // but never block the passenger dashboard on another setSession() call.
  useEffect(() => {
    if (!ready || !session?.user) return

    const revealTimer = window.setTimeout(() => {
      setShowDashboard(true)
    }, 650)

    return () => window.clearTimeout(revealTimer)
  }, [ready, session?.user?.id])

  if (!ready || !session?.user) {
    return <LoadingScreen />
  }

  return (
    <>
      {!showDashboard && <LoadingScreen />}
      <div style={{ display: showDashboard ? 'contents' : 'none' }}>
        <HomePage />
      </div>
    </>
  )
}

function LoadingScreen() {
  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#eef4f7', color: '#536579', fontFamily: 'system-ui, sans-serif', fontWeight: 800 }}>
      Connexion en cours…
    </main>
  )
}
