'use client'

import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import HomePage from '../../page'
import { supabase } from '../../../lib/supabase'

function readStoredSession(): Session | null {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!url) return null
    const projectRef = new URL(url).hostname.split('.')[0]
    const raw = window.localStorage.getItem(`sb-${projectRef}-auth-token`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const session = (parsed?.currentSession ?? parsed?.session ?? parsed) as Session | null
    return session?.user && session?.access_token ? session : null
  } catch {
    return null
  }
}

export default function PassengerDashboardPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    let restoreAuth: (() => void) | null = null

    const finishWithSession = (stableSession: Session) => {
      if (!active) return

      const originalGetUser = supabase.auth.getUser.bind(supabase.auth)
      const originalOnAuthStateChange = supabase.auth.onAuthStateChange.bind(supabase.auth)

      supabase.auth.getUser = (async () => ({
        data: { user: stableSession.user },
        error: null,
      })) as typeof supabase.auth.getUser

      supabase.auth.onAuthStateChange = ((callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) => {
        return originalOnAuthStateChange((event, nextSession) => {
          callback(event, nextSession?.user ? nextSession : stableSession)
        })
      }) as typeof supabase.auth.onAuthStateChange

      restoreAuth = () => {
        supabase.auth.getUser = originalGetUser as typeof supabase.auth.getUser
        supabase.auth.onAuthStateChange = originalOnAuthStateChange as typeof supabase.auth.onAuthStateChange
      }

      setSession(stableSession)
      setReady(true)
    }

    const loadSession = async () => {
      const localSession = readStoredSession()

      try {
        const result = await Promise.race([
          supabase.auth.getSession(),
          new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 1400)),
        ])

        if (!active) return

        const remoteSession = result && 'data' in result ? result.data.session : null
        const stableSession = remoteSession?.user ? remoteSession : localSession

        if (stableSession?.user) {
          finishWithSession(stableSession)
          return
        }
      } catch {
        if (localSession?.user) {
          finishWithSession(localSession)
          return
        }
      }

      if (!active) return
      setReady(true)
      window.location.replace('/passenger/login')
    }

    void loadSession()

    return () => {
      active = false
      restoreAuth?.()
    }
  }, [])

  if (!ready || !session?.user) {
    return <LoadingScreen />
  }

  return <HomePage />
}

function LoadingScreen() {
  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#eef4f7', color: '#536579', fontFamily: 'system-ui, sans-serif', fontWeight: 800 }}>
      Connexion en cours…
    </main>
  )
}
