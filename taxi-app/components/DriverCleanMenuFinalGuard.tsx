'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function DriverCleanMenuFinalGuard() {
  useEffect(() => {
    if (window.location.pathname !== '/driver/dashboard-v2') return

    const handleClick = async (event: MouseEvent) => {
      const target = event.target as Element | null
      if (!target) return

      const logout = target.closest('.dcm-logout')
      if (logout) {
        event.preventDefault()
        event.stopPropagation()
        try { await supabase.auth.signOut() } catch {}
        try {
          localStorage.removeItem('movi-session')
          localStorage.removeItem('taxi-auth-default')
        } catch {}
        window.location.replace('/movi-app-v2')
        return
      }

      const langButton = target.closest('.dcm-lang button') as HTMLButtonElement | null
      if (langButton) {
        window.setTimeout(() => window.location.reload(), 120)
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  return null
}
