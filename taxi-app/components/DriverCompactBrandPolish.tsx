'use client'

import { useEffect } from 'react'

export default function DriverCompactBrandPolish() {
  useEffect(() => {
    if (location.pathname !== '/driver/dashboard') return

    const apply = () => {
      const brand = document.querySelector('.brand') as HTMLElement | null
      if (!brand) return

      const textWrap = brand.querySelector('div') as HTMLElement | null
      const title = textWrap?.querySelector('strong') as HTMLElement | null
      const subtitle = textWrap?.querySelector('small') as HTMLElement | null
      const wantedSubtitle = localStorage.getItem('taxi-language') === 'ht' ? 'Chofè' : 'Chauffeur'

      if (title && title.textContent !== 'Taxi Haiti') title.textContent = 'Taxi Haiti'
      if (subtitle && subtitle.textContent !== wantedSubtitle) subtitle.textContent = wantedSubtitle

      if (brand.dataset.compactBrandPolished !== 'true') {
        brand.dataset.compactBrandPolished = 'true'
        Object.assign(brand.style, {
          minWidth: '0',
          flex: '1 1 auto',
          gap: '8px'
        })
        if (textWrap) Object.assign(textWrap.style, { minWidth: '0' })
        if (title) Object.assign(title.style, {
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '15px',
          lineHeight: '1.15'
        })
        if (subtitle) Object.assign(subtitle.style, {
          fontSize: '10px',
          lineHeight: '1.1',
          marginTop: '1px'
        })
      }
    }

    apply()
    const observer = new MutationObserver(() => {
      if (!document.querySelector('.brand')) return
      apply()
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
