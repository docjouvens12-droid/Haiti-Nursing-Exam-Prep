'use client'

import { useEffect } from 'react'

const RECOVERY_KEY = 'portail-scolaire-safari-auth-recovery-v2'

export default function SafariAuthRecovery() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const page = document.querySelector('.ps-page')
      if (!page) return

      const notices = Array.from(page.querySelectorAll('.notice')) as HTMLElement[]
      const loadingNotice = notices.find((el) => {
        const text = (el.textContent || '').trim().toLowerCase()
        return text === 'chargement...' || text === 'chajman...'
      })
      const hasLogin = Boolean(page.querySelector('.loginWrap'))

      if (!loadingNotice || hasLogin) {
        sessionStorage.removeItem(RECOVERY_KEY)
        return
      }

      // Only one gentle auth reset per tab. Do not touch caches or service workers.
      if (sessionStorage.getItem(RECOVERY_KEY) === '1') {
        loadingNotice.textContent = 'La connexion prend trop de temps. Fermez cet onglet puis ouvrez de nouveau le lien.'
        return
      }

      sessionStorage.setItem(RECOVERY_KEY, '1')

      try {
        for (let i = localStorage.length - 1; i >= 0; i -= 1) {
          const key = localStorage.key(i)
          if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
            localStorage.removeItem(key)
          }
        }
      } catch {}

      const url = new URL(window.location.href)
      url.searchParams.set('auth_reset', String(Date.now()))
      window.location.replace(url.toString())
    }, 5000)

    return () => window.clearTimeout(timer)
  }, [])

  return null
}
