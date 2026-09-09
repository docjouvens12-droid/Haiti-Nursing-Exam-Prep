'use client'

import { useEffect } from 'react'

export default function DriverCompactBrandPolish() {
  useEffect(() => {
    if (location.pathname !== '/driver/dashboard') return

    const apply = () => {
      const topbar = document.querySelector('.topbar') as HTMLElement | null
      const brand = document.querySelector('.brand') as HTMLElement | null
      if (!topbar || !brand) return

      const menuButton = topbar.querySelector('.menuButton') as HTMLElement | null
      const logo = brand.querySelector(':scope > span') as HTMLElement | null
      const textWrap = brand.querySelector('div') as HTMLElement | null
      const title = textWrap?.querySelector('strong') as HTMLElement | null
      const subtitle = textWrap?.querySelector('small') as HTMLElement | null
      const wantedSubtitle = localStorage.getItem('taxi-language') === 'ht' ? 'Chofè' : 'Chauffeur'

      if (logo && logo.textContent !== '🚕') logo.textContent = '🚕'
      if (title && title.textContent !== 'Taxi Haiti') title.textContent = 'Taxi Haiti'
      if (subtitle && subtitle.textContent !== wantedSubtitle) subtitle.textContent = wantedSubtitle

      Object.assign(topbar.style, {
        position: 'relative',
        minHeight: '62px',
        display: 'flex',
        alignItems: 'center'
      })

      if (menuButton) Object.assign(menuButton.style, {
        position: 'relative',
        zIndex: '20',
        pointerEvents: 'auto',
        flex: '0 0 auto'
      })

      Object.assign(brand.style, {
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '9px',
        width: 'max-content',
        maxWidth: 'calc(100% - 120px)',
        minWidth: '0',
        pointerEvents: 'none',
        zIndex: '1'
      })

      if (logo) Object.assign(logo.style, {
        width: '42px',
        height: '42px',
        minWidth: '42px',
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        background: '#0F705A',
        color: '#fff',
        fontSize: '20px',
        lineHeight: '1',
        boxShadow: '0 5px 16px rgba(15,112,90,.22)'
      })

      if (textWrap) Object.assign(textWrap.style, {
        minWidth: '0',
        textAlign: 'left'
      })

      if (title) Object.assign(title.style, {
        display: 'block',
        color: '#102033',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: '19px',
        fontWeight: '900',
        letterSpacing: '-0.02em',
        lineHeight: '1.05'
      })

      if (subtitle) Object.assign(subtitle.style, {
        display: 'inline-block',
        width: 'fit-content',
        marginTop: '5px',
        padding: '3px 8px',
        borderRadius: '999px',
        background: '#E9F6F1',
        color: '#0F705A',
        fontSize: '9px',
        fontWeight: '900',
        lineHeight: '1.2',
        letterSpacing: '.03em'
      })
    }

    apply()
    const observer = new MutationObserver(apply)
    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('taxi-language-change', apply)
    return () => {
      observer.disconnect()
      window.removeEventListener('taxi-language-change', apply)
    }
  }, [])

  return null
}
