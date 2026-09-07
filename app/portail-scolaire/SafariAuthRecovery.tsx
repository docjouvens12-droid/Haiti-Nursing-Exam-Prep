'use client'

import { useEffect } from 'react'

const AUTH_KEY = 'sb-vncrujkndfpatwvxtchk-auth-token'
const RECOVERY_KEY = 'portail-scolaire-safari-auth-recovery'

export default function SafariAuthRecovery() {
  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const page = document.querySelector('.ps-page')
      if (!page) return

      const loading = Array.from(page.querySelectorAll('.notice')).some((el) => {
        const text = (el.textContent || '').trim().toLowerCase()
        return text === 'chargement...' || text === 'chajman...'
      })
      const hasLogin = Boolean(page.querySelector('.loginWrap'))

      if (!loading || hasLogin) {
        sessionStorage.removeItem(RECOVERY_KEY)
        return
      }

      // One automatic recovery attempt per tab/session to avoid reload loops.
      if (sessionStorage.getItem(RECOVERY_KEY) === '1') {
        const notices = Array.from(page.querySelectorAll('.notice')) as HTMLElement[]
        const loadingNotice = notices.find((el) => {
          const text = (el.textContent || '').trim().toLowerCase()
          return text === 'chargement...' || text === 'chajman...'
        })
        if (loadingNotice) {
          loadingNotice.textContent = 'La session a pris trop de temps. Actualisez la page une fois pour réessayer.'
        }
        return
      }

      sessionStorage.setItem(RECOVERY_KEY, '1')

      try {
        localStorage.removeItem(AUTH_KEY)
        for (let i = localStorage.length - 1; i >= 0; i -= 1) {
          const key = localStorage.key(i)
          if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
            localStorage.removeItem(key)
          }
        }
      } catch {}

      try {
        if ('caches' in window) {
          const keys = await caches.keys()
          await Promise.all(
            keys.filter((key) => key.startsWith('portail-scolaire-')).map((key) => caches.delete(key)),
          )
        }
      } catch {}

      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations()
          await Promise.all(
            regs
              .filter((reg) => {
                const script = reg.active?.scriptURL || reg.waiting?.scriptURL || reg.installing?.scriptURL || ''
                return script.includes('portail-scolaire-sw.js') || reg.scope.includes('/portail-scolaire/')
              })
              .map((reg) => reg.unregister()),
          )
        }
      } catch {}

      const url = new URL(window.location.href)
      url.searchParams.set('auth_recovered', String(Date.now()))
      window.location.replace(url.toString())
    }, 5000)

    return () => window.clearTimeout(timer)
  }, [])

  return null
}
