'use client'

import { useEffect, useState } from 'react'
import { createClient, type Session } from '@supabase/supabase-js'
import HomePage from '../../page'
import { supabase } from '../../../lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

function defaultSessionClient() {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: 'taxi-auth-default',
    },
  })
}

export default function PassengerDashboardPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    async function loadSession() {
      try {
        let { data, error } = await supabase.auth.getSession()
        if (!active) return

        if (error || !data.session?.user) {
          const fallback = defaultSessionClient()
          const { data: fallbackData } = await fallback.auth.getSession()

          if (fallbackData.session?.user) {
            const { error: persistError } = await supabase.auth.setSession({
              access_token: fallbackData.session.access_token,
              refresh_token: fallbackData.session.refresh_token,
            })

            if (!persistError) {
              const refreshed = await supabase.auth.getSession()
              data = refreshed.data
              error = refreshed.error
            }
          }
        }

        if (!active) return

        if (error || !data.session?.user) {
          setReady(true)
          window.location.replace('/login')
          return
        }

        setSession(data.session)
        setReady(true)
      } catch {
        if (!active) return
        setReady(true)
        window.location.replace('/login')
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
