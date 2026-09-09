'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function PassengerRootAuthRedirect() {
  useEffect(() => {
    if (window.location.pathname !== '/') return
    let active = true
    let pollTimer: number | null = null

    const redirectIfSignedIn = async () => {
      const { data } = await supabase.auth.getSession()
      if (!active) return false
      if (data.session?.user) {
        window.location.replace('/passenger/dashboard')
        return true
      }
      return false
    }

    const pollForSession = () => {
      let attempts = 0
      if (pollTimer) window.clearInterval(pollTimer)
      pollTimer = window.setInterval(async () => {
        attempts += 1
        const done = await redirectIfSignedIn()
        if (done || attempts >= 40) {
          if (pollTimer) window.clearInterval(pollTimer)
          pollTimer = null
        }
      }, 125)
    }

    void redirectIfSignedIn()

    const handleSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement | null
      if (!form?.classList.contains('auth-form')) return
      pollForSession()
    }

    document.addEventListener('submit', handleSubmit, true)

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      if (session?.user && window.location.pathname === '/') {
        window.location.replace('/passenger/dashboard')
      }
    })

    return () => {
      active = false
      document.removeEventListener('submit', handleSubmit, true)
      if (pollTimer) window.clearInterval(pollTimer)
      listener.subscription.unsubscribe()
    }
  }, [])

  return null
}
