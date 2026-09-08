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

      const { data: primed, error } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      })

      if (!active) return

      const stableSession = primed.session ?? data.session
      if (error || !stableSession?.user) {
        window.location.replace('/passenger/login')
        return
      }

      setSession(stableSession)
      setReady(true)
    }

    void loadSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active || !nextSession?.user) return
      setSession(nextSession)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  // HomePage still contains the legacy embedded login. Mount it while hidden
  // first so its auth listener is registered, then re-emit the already
  // validated passenger session. This makes HomePage receive the signed-in
  // user before it becomes visible and prevents the green login screen from
  // flashing or getting stuck on Safari/iPhone.
  useEffect(() => {
    if (!ready || !session?.user) return

    let cancelled = false
    let timer1: number | undefined
    let timer2: number | undefined
    let revealTimer: number | undefined

    const reemitSession = async () => {
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      })
      if (cancelled) return

      timer2 = window.setTimeout(() => {
        void supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        })
      }, 180)

      revealTimer = window.setTimeout(() => {
        if (!cancelled) setShowDashboard(true)
      }, 500)
    }

    timer1 = window.setTimeout(() => {
      void reemitSession()
    }, 60)

    return () => {
      cancelled = true
      if (timer1) window.clearTimeout(timer1)
      if (timer2) window.clearTimeout(timer2)
      if (revealTimer) window.clearTimeout(revealTimer)
    }
  }, [ready, session])

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
