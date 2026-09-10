'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

async function routeUser(userId: string) {
  if (window.location.pathname !== '/') return

  const { data: profile } = await supabase
    .from('profiles')
    .select('role,passenger_onboarding_completed')
    .eq('id', userId)
    .maybeSingle()

  if (profile?.role === 'admin') {
    const { data: mustChange } = await supabase.rpc('admin_requires_password_change')
    window.location.replace(mustChange ? '/admin/set-password' : '/admin')
    return
  }

  if (profile?.role === 'driver') {
    const { data: driver } = await supabase
      .from('driver_profiles')
      .select('status,application_submitted_at')
      .eq('user_id', userId)
      .maybeSingle()

    if (driver?.status === 'approved') {
      window.location.replace('/driver/dashboard')
      return
    }

    window.location.replace('/driver')
    return
  }

  if (profile?.role === 'passenger' && !profile.passenger_onboarding_completed) {
    window.location.replace('/passenger/complete-registration')
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
