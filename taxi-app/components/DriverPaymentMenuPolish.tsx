'use client'

import { useEffect } from 'react'

export default function DriverPaymentMenuPolish() {
  useEffect(() => {
    if (window.location.pathname !== '/driver/dashboard') return

    const styleId = 'driver-payment-menu-polish-style'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        .driver-payment-menu-section{padding:0 2px;border-bottom:1px solid #e5eaee}
        .driver-payment-menu-trigger{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;border:0;background:transparent;padding:16px 0;color:#0f6f59;font-size:15px;font-weight:800;text-align:left}
        .driver-payment-menu-trigger .arrow{font-size:22px;line-height:1;transition:transform .18s ease}
        .driver-payment-menu-section.open .driver-payment-menu-trigger .arrow{transform:rotate(90deg)}
        .driver-payment-menu-content{display:none;padding:0 0 12px}
        .driver-payment-menu-section.open .driver-payment-menu-content{display:block}
        .driver-payment-menu-option{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:8px 0;padding:10px 12px;border-radius:12px;background:#f6f9fa;border:1px solid #e3e9ee;font-size:13px}
        .driver-payment-menu-option strong{font-weight:900;color:#102033}
      `
      document.head.appendChild(style)
    }

    const apply = () => {
      const drawer = document.querySelector<HTMLElement>('.drawer')
      if (!drawer || drawer.querySelector('[data-driver-payment-menu="true"]')) return

      const lang = localStorage.getItem('taxi-language') === 'ht' ? 'ht' : 'fr'
      const section = document.createElement('div')
      section.className = 'driver-payment-menu-section'
      section.dataset.driverPaymentMenu = 'true'
      section.innerHTML = `
        <button type="button" class="driver-payment-menu-trigger" aria-expanded="false">
          <span>${lang === 'ht' ? 'Peman' : 'Paiements'}</span>
          <span class="arrow" aria-hidden="true">›</span>
        </button>
        <div class="driver-payment-menu-content">
          <div class="driver-payment-menu-option"><span>MonCash</span><strong>${lang === 'ht' ? 'Disponib' : 'Disponible'}</strong></div>
          <div class="driver-payment-menu-option"><span>NatCash</span><strong>${lang === 'ht' ? 'Disponib' : 'Disponible'}</strong></div>
        </div>
      `

      section.querySelector<HTMLButtonElement>('.driver-payment-menu-trigger')?.addEventListener('click', () => {
        const open = section.classList.toggle('open')
        section.querySelector<HTMLButtonElement>('.driver-payment-menu-trigger')?.setAttribute('aria-expanded', String(open))
      })

      const languageSection = Array.from(drawer.querySelectorAll<HTMLElement>('.menuSection')).find((item) => {
        const text = item.querySelector('h3')?.textContent?.trim().toLowerCase() ?? ''
        return text === 'langue' || text === 'lang'
      })
      if (languageSection) drawer.insertBefore(section, languageSection)
      else {
        const logout = drawer.querySelector('.drawerLogout')
        if (logout) drawer.insertBefore(section, logout)
        else drawer.appendChild(section)
      }
    }

    apply()
    const observer = new MutationObserver(apply)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
