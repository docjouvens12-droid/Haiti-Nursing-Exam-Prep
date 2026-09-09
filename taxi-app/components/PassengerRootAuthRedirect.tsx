'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function PassengerRootAuthRedirect() {
  useEffect(() => {
    if (window.location.pathname !== '/') return
    let active = true

    const go = async () => {
      const { data } = await supabase.auth.getSession()
      if (!active) return
      if (data.session?.user) {
        window.location.replace('/passenger/dashboard')
      }
    }

    void go()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      if (session?.user && window.location.pathname === '/') {
        window.location.replace('/passenger/dashboard')
      }
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return null
}
