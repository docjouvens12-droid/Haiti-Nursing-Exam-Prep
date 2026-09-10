'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

async function routeUser(userId: string) {
  if (window.location.pathname !== '/') return

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if (profile?.role === 'admin') {
    window.location.replace('/admin')
    return
  }

  if (profile?.role === 'driver') {
    const { data: driver } = await supabase
      .from('driver_profiles')
      .select('status')
      .eq('user_id', userId)
      .maybeSingle()

    if (driver?.status === 'approved') {
      window.location.replace('/driver/dashboard')
      return
    }

    window.location.replace('/driver')
  }
}

export default function AuthRoleRedirector() {
  useEffect(() => {
    let active = true

    supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) void routeUser(data.user.id)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active || event !== 'SIGNED_IN' || !session?.user) return
      window.setTimeout(() => {
        if (active) void routeUser(session.user.id)
      }, 0)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return null
}
