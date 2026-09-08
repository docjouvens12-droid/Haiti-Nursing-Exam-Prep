'use client'

import { useEffect } from 'react'

export default function DriverLogoutPolish() {
  useEffect(() => {
    if (location.pathname !== '/driver/dashboard') return

    const styleId = 'driver-logout-polish'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        .drawer .drawerLogout {
          width:auto !important;
          min-width:150px !important;
          max-width:100% !important;
          min-height:42px !important;
          margin:22px auto 8px !important;
          padding:10px 16px !important;
          border:1px solid #f0caca !important;
          border-radius:13px !important;
          background:#fff4f4 !important;
          color:#9b3030 !important;
          font-size:14px !important;
          font-weight:800 !important;
          line-height:1.2 !important;
          display:flex !important;
          align-items:center !important;
          justify-content:center !important;
          gap:8px !important;
          box-shadow:none !important;
        }
        .drawer .drawerLogout:active {
          background:#fdeaea !important;
          transform:scale(.98);
        }
      `
      document.head.appendChild(style)
    }

    const apply = () => {
      const button = document.querySelector<HTMLButtonElement>('.drawer .drawerLogout')
      if (!button) return

      const lang = localStorage.getItem('taxi-language') === 'ht' ? 'ht' : 'fr'
      const label = lang === 'ht' ? 'Dekonekte' : 'Se déconnecter'
      if (button.textContent !== `⎋ ${label}`) button.textContent = `⎋ ${label}`

      if (button.dataset.logoutConfirm === 'true') return
      button.dataset.logoutConfirm = 'true'

      button.addEventListener('click', (event) => {
        const currentLang = localStorage.getItem('taxi-language') === 'ht' ? 'ht' : 'fr'
        const ok = window.confirm(
          currentLang === 'ht'
            ? 'Èske ou vle dekonekte?'
            : 'Voulez-vous vous déconnecter ?'
        )
        if (!ok) {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
        }
      }, true)
    }

    apply()
    const observer = new MutationObserver(apply)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
