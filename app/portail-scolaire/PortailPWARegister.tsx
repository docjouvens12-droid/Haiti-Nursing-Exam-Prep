'use client'

import { useEffect } from 'react'

export default function PortailPWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const register = async () => {
      try {
        await navigator.serviceWorker.register('/portail-scolaire-sw.js', {
          scope: '/portail-scolaire/',
        })
      } catch (error) {
        console.warn('Portail Scolaire service worker registration failed', error)
      }
    }

    void register()
  }, [])

  return null
}
