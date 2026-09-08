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
    let restoreAuthMethods: (() => void) | null = null

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!active) return

      if (!data.session?.user) {
        setReady(true)
        window.location.replace('/passenger/login')
        return
      }

      const { data: primed, error: primeError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      })

      if (!active) return

      if (primeError || !primed.session?.user) {
        setReady(true)
        window.location.replace('/passenger/login')
        return
      }

      const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession(primed.session)
      if (!active) return

      const stableSession = refreshed.session ?? primed.session
      if (refreshError || !stableSession?.user) {
        setReady(true)
        window.location.replace('/passenger/login')
        return
      }

      const { data: verified, error: verifyError } = await supabase.auth.getUser()
      if (!active) return

      if (verifyError || !verified.user) {
        setReady(true)
        window.location.replace('/passenger/login')
        return
      }

      // The passenger session is already fully validated here. HomePage still
      // has legacy auth bootstrap code that calls both getUser() and
      // onAuthStateChange(). Safari can emit a transient null auth event during
      // that second bootstrap and HomePage then renders its old embedded green
      // login screen. Keep auth reads deterministic while this protected
      // dashboard is mounted and ignore only those transient null events.
      const originalGetUser = supabase.auth.getUser.bind(supabase.auth)
      const originalOnAuthStateChange = supabase.auth.onAuthStateChange.bind(supabase.auth)

      supabase.auth.getUser = (async () => ({
        data: { user: verified.user },
        error: null,
      })) as typeof supabase.auth.getUser

      supabase.auth.onAuthStateChange = ((callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) => {
        return originalOnAuthStateChange((event, nextSession) => {
          callback(event, nextSession?.user ? nextSession : stableSession)
        })
      }) as typeof supabase.auth.onAuthStateChange

      restoreAuthMethods = () => {
        supabase.auth.getUser = originalGetUser as typeof supabase.auth.getUser
        supabase.auth.onAuthStateChange = originalOnAuthStateChange as typeof supabase.auth.onAuthStateChange
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
      restoreAuthMethods?.()
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
