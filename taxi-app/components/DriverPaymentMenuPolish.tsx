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
        .driver-payment-menu-section{padding:16px 2px;border-bottom:1px solid #e5eaee}
        .driver-payment-menu-section h3{margin:0 0 10px;font-size:14px;color:#0f6f59}
        .driver-payment-menu-option{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:8px 0;padding:10px 12px;border-radius:12px;background:#f6f9fa;border:1px solid #e3e9ee;font-size:13px}
        .driver-payment-menu-option strong{font-weight:900;color:#102033}
        .driver-payment-menu-split{margin-top:10px;padding:11px 12px;border-radius:12px;background:#eef7f4;color:#115f4d;font-size:12px;font-weight:850;text-align:center}
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
        <h3>${lang === 'ht' ? 'Peman' : 'Paiements'}</h3>
        <div class="driver-payment-menu-option"><span>MonCash</span><strong>${lang === 'ht' ? 'Disponib' : 'Disponible'}</strong></div>
        <div class="driver-payment-menu-option"><span>NatCash</span><strong>${lang === 'ht' ? 'Disponib' : 'Disponible'}</strong></div>
        <div class="driver-payment-menu-split">${lang === 'ht' ? 'Chofè 85% · Platfòm 15%' : 'Chauffeur 85% · Plateforme 15%'}</div>
      `

      const logout = drawer.querySelector('.drawerLogout')
      if (logout) drawer.insertBefore(section, logout)
      else drawer.appendChild(section)
    }

    apply()
    const observer = new MutationObserver(apply)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
