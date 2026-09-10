'use client'

import { useEffect } from 'react'

export default function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js?v=5', {
          scope: '/',
          updateViaCache: 'none',
        })
        await registration.update()
      } catch {
        // PWA maintenance must never block the application.
      }
    }

    if (document.readyState === 'complete') void register()
    else window.addEventListener('load', register, { once: true })

    return () => {
      window.removeEventListener('load', register)
    }
  }, [])

  return null
}
