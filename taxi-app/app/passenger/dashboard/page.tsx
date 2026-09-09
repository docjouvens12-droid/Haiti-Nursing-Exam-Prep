'use client'

import { useEffect, useState } from 'react'
import HomePage from '../../page'
import { supabase } from '../../../lib/supabase'

export default function PassengerDashboardPage() {
  const [checked, setChecked] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [showBootOverlay, setShowBootOverlay] = useState(false)

  useEffect(() => {
    let active = true
    let overlayTimer: number | null = null

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!active) return
      const signedIn = Boolean(data.session?.user)
      setHasSession(signedIn)
      setChecked(true)

      if (signedIn) {
        setShowBootOverlay(true)
        overlayTimer = window.setTimeout(() => {
          if (active) setShowBootOverlay(false)
        }, 900)
      }
    }

    void syncSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      const signedIn = Boolean(session?.user)
      setHasSession(signedIn)
      setChecked(true)
      if (signedIn) {
        setShowBootOverlay(true)
        if (overlayTimer) window.clearTimeout(overlayTimer)
        overlayTimer = window.setTimeout(() => {
          if (active) setShowBootOverlay(false)
        }, 900)
      }
    })

    return () => {
      active = false
      if (overlayTimer) window.clearTimeout(overlayTimer)
      listener.subscription.unsubscribe()
    }
  }, [])

  if (!checked) return <SessionLoading />

  return (
    <>
      <HomePage />
      {hasSession && showBootOverlay ? <SessionLoading /> : null}
    </>
  )
}

function SessionLoading() {
  return (
    <main style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'grid', placeItems: 'center', background: '#eef4f7', color: '#536579', fontFamily: 'system-ui, sans-serif', fontWeight: 800 }}>
      Connexion en cours…
    </main>
  )
}
