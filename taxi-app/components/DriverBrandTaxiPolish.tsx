'use client'

import { useEffect } from 'react'

export default function DriverBrandTaxiPolish() {
  useEffect(() => {
    if (location.pathname !== '/driver/dashboard') return

    const apply = () => {
      const brand = document.querySelector('.brand') as HTMLElement | null
      if (!brand || brand.dataset.taxiBrandPolished === 'true') return
      const mark = brand.querySelector(':scope > span') as HTMLElement | null
      if (!mark) return

      brand.dataset.taxiBrandPolished = 'true'
      const button = document.createElement('button')
      button.type = 'button'
      button.setAttribute('aria-label', 'Remonte anlè dashboard la')
      button.textContent = '🚕'
      Object.assign(button.style, {
        width: '44px', height: '44px', border: '0', borderRadius: '14px',
        display: 'grid', placeItems: 'center', background: '#0f6f59',
        fontSize: '23px', cursor: 'pointer', padding: '0', flex: '0 0 auto'
      })
      button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }))
      mark.replaceWith(button)
    }

    apply()
    const observer = new MutationObserver(apply)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
