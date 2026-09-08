'use client'

import { useEffect } from 'react'

export default function DriverPaymentMethodPolish() {
  useEffect(() => {
    if (window.location.pathname !== '/driver/dashboard') return

    const styleId = 'driver-payment-method-polish'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        .driver-payment-method {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          margin-top:2px;
          padding:11px 12px;
          border-radius:14px;
          background:#fff8e8;
          border:1px solid #f1ddb0;
          color:#5d4618;
        }
        .driver-payment-method span { font-size:12px; font-weight:750; }
        .driver-payment-method strong { font-size:13px; font-weight:900; }
      `
      document.head.appendChild(style)
    }

    const apply = () => {
      const lang = localStorage.getItem('taxi-language') === 'ht' ? 'ht' : 'fr'
      document.querySelectorAll<HTMLElement>('.ride-card').forEach((card) => {
        if (card.querySelector('[data-driver-payment-method="true"]')) return
        const row = document.createElement('div')
        row.className = 'driver-payment-method'
        row.dataset.driverPaymentMethod = 'true'
        const label = document.createElement('span')
        const value = document.createElement('strong')
        label.textContent = lang === 'ht' ? 'Metòd peman' : 'Mode de paiement'
        value.textContent = lang === 'ht' ? '💵 Lajan kach' : '💵 Espèces'
        row.append(label, value)
        card.appendChild(row)
      })
    }

    apply()
    const observer = new MutationObserver(apply)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
