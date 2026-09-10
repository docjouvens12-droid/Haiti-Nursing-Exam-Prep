'use client'

import { useEffect } from 'react'

const PWA_RESET_VERSION = '2026-09-10-cache-reset-v1'
const PWA_RESET_KEY = 'taxi-pwa-reset-version'

export default function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    let reloading = false

    const boot = async () => {
      try {
        const resetDone = window.localStorage.getItem(PWA_RESET_KEY) === PWA_RESET_VERSION

        if (!resetDone) {
          const registrations = await navigator.serviceWorker.getRegistrations()
          await Promise.all(registrations.map((registration) => registration.unregister()))

          if ('caches' in window) {
            const cacheKeys = await caches.keys()
            await Promise.all(cacheKeys.map((key) => caches.delete(key)))
          }

          window.localStorage.setItem(PWA_RESET_KEY, PWA_RESET_VERSION)
          window.location.replace(window.location.href)
          return
        }

        const registration = await navigator.serviceWorker.register('/sw.js?v=3', {
          scope: '/',
          updateViaCache: 'none',
        })
        await registration.update()
      } catch {
        // Never block the application if PWA maintenance fails.
      }
    }

    const handleControllerChange = () => {
      if (reloading) return
      reloading = true
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

    if (document.readyState === 'complete') void boot()
    else window.addEventListener('load', boot, { once: true })

    return () => {
      window.removeEventListener('load', boot)
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
    }
  }, [])

  return null
}
