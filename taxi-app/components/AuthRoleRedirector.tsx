'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ROUTING_CLASS = 'taxi-role-routing'
const PUBLIC_ENTRY_PATHS = new Set(['/', '/movi', '/movi-app-v2'])

function isPublicEntryPath() {
  return PUBLIC_ENTRY_PATHS.has(window.location.pathname)
}

function beginRoleRouting() {
  if (isPublicEntryPath()) document.body.classList.add(ROUTING_CLASS)
}

function finishRoleRouting() {
  document.body.classList.remove(ROUTING_CLASS)
}

async function routeUser(userId: string) {
  if (!isPublicEntryPath()) return
  beginRoleRouting()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role,passenger_onboarding_completed')
    .eq('id', userId)
    .maybeSingle()

  if (profileError || !profile) {
    finishRoleRouting()
    return
  }

  if (profile.role === 'admin' || profile.role === 'super_admin') {
    const { data: mustChange } = await supabase.rpc('admin_requires_password_change')
    window.location.replace(mustChange ? '/admin/set-password' : '/admin')
    return
  }

  if (profile.role === 'driver') {
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

  if (profile.role === 'passenger' && !profile.passenger_onboarding_completed) {
    window.location.replace('/passenger/complete-registration')
    return
  }

  // Only a fully registered passenger is allowed to reveal the passenger dashboard.
  finishRoleRouting()
}

export default function AuthRoleRedirector() {
  useEffect(() => {
    let active = true

    // Hide passenger UI on every shared public entry route until role is known.
    if (isPublicEntryPath()) beginRoleRouting()

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      if (data.user) void routeUser(data.user.id)
      else finishRoleRouting()
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return

      if (event === 'SIGNED_OUT' || !session?.user) {
        finishRoleRouting()
        return
      }

      if (event === 'SIGNED_IN') {
        beginRoleRouting()
        window.setTimeout(() => {
          if (active) void routeUser(session.user.id)
        }, 0)
      }
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
      finishRoleRouting()
    }
  }, [])

  return <style jsx global>{`
    body.${ROUTING_CLASS} .shell,
    body.${ROUTING_CLASS} .phone-frame,
    body.${ROUTING_CLASS} .passenger-dashboard,
    body.${ROUTING_CLASS} .passenger-hard-v2 {
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }

    body.${ROUTING_CLASS}::after {
      content: '';
      position: fixed;
      inset: 0;
      z-index: 2147479000;
      background: #ffffff;
      pointer-events: none;
    }
  `}</style>
}
