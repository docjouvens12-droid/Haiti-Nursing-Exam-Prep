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

  return <style jsx global>{`
    /* Keep an expanded section from pushing Revenus, Langue, Aide and logout
       out of sight on iPhone. The section scrolls inside the drawer instead. */
    .dcm-panel {
      max-height: 38vh !important;
      overflow-y: auto !important;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
    }

    .dcm-trips {
      max-height: min(300px, 34vh) !important;
      overflow-y: auto !important;
      padding-right: 4px !important;
    }

    /* Keep the sign-out action reachable even with long ride history. */
    .dcm-logout {
      position: sticky !important;
      bottom: 0 !important;
      z-index: 20 !important;
      background: #fff7f7 !important;
      box-shadow: 0 -10px 18px rgba(255,255,255,.96) !important;
    }
  `}</style>
}
