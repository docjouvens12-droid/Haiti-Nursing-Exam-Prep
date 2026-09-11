'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ROUTING_CLASS = 'taxi-role-routing'
const PUBLIC_ENTRY_PATHS = new Set(['/', '/movi', '/movi-app-v2'])

function currentPath() {
  return window.location.pathname
}

function isPublicEntryPath(path = currentPath()) {
  return PUBLIC_ENTRY_PATHS.has(path)
}

function beginRoleRouting() {
  if (isPublicEntryPath()) document.body.classList.add(ROUTING_CLASS)
}

function finishRoleRouting() {
  document.body.classList.remove(ROUTING_CLASS)
}

function replaceIfNeeded(target: string) {
  if (currentPath() === target) {
    finishRoleRouting()
    return false
  }
  window.location.replace(target)
  return true
}

async function routeUser(userId: string) {
  const path = currentPath()
  if (isPublicEntryPath(path)) beginRoleRouting()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role,passenger_onboarding_completed')
    .eq('id', userId)
    .maybeSingle()

  if (profileError || !profile) {
    finishRoleRouting()
    return
  }

  if (profile.role === 'admin') {
    if (path.startsWith('/admin')) {
      finishRoleRouting()
      return
    }
    const { data: mustChange } = await supabase.rpc('admin_requires_password_change')
    replaceIfNeeded(mustChange ? '/admin/set-password' : '/admin')
    return
  }

  if (profile.role === 'driver') {
    const { data: driver } = await supabase
      .from('driver_profiles')
      .select('status')
      .eq('user_id', userId)
      .maybeSingle()

    const target = driver?.status === 'approved' ? '/driver/dashboard' : '/driver'
    if (path.startsWith('/driver') && (target === '/driver' || path === '/driver/dashboard')) {
      finishRoleRouting()
      return
    }
    replaceIfNeeded(target)
    return
  }

  if (profile.role === 'passenger') {
    if (!profile.passenger_onboarding_completed) {
      replaceIfNeeded('/passenger/complete-registration')
      return
    }

    // A passenger must never remain inside driver/admin areas.
    if (path.startsWith('/driver') || path.startsWith('/admin')) {
      replaceIfNeeded('/')
      return
    }

    finishRoleRouting()
    return
  }

  finishRoleRouting()
}

export default function AuthRoleRedirector() {
  useEffect(() => {
    let active = true

    if (isPublicEntryPath()) beginRoleRouting()

    const routeCurrentUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!active) return
      if (data.user) await routeUser(data.user.id)
      else finishRoleRouting()
    }

    void routeCurrentUser()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return

      if (event === 'SIGNED_OUT' || !session?.user) {
        finishRoleRouting()
        return
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (isPublicEntryPath()) beginRoleRouting()
        window.setTimeout(() => {
          if (active) void routeUser(session.user.id)
        }, 0)
      }
    })

    // Safety check for PWA/iOS navigation where auth events can be delayed.
    const watchdog = window.setInterval(() => {
      if (active) void routeCurrentUser()
    }, 2500)

    return () => {
      active = false
      window.clearInterval(watchdog)
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
