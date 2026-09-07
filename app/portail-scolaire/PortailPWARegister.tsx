'use client'

import { useEffect } from 'react'

export default function PortailPWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const preparePwa = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(
          registrations
            .filter((registration) => !registration.active?.scriptURL.endsWith('/portail-scolaire-sw.js'))
            .map((registration) => registration.unregister())
        )

        if ('caches' in window) {
          const keys = await caches.keys()
          await Promise.all(
            keys
              .filter((key) => !key.startsWith('portail-scolaire-v2'))
              .map((key) => caches.delete(key))
          )
        }

        await navigator.serviceWorker.register('/portail-scolaire-sw.js', {
          scope: '/portail-scolaire/',
          updateViaCache: 'none',
        })
      } catch (error) {
        console.warn('Portail Scolaire service worker preparation failed', error)
      }
    }

    void preparePwa()
  }, [])

  return null
}
