'use client'

import { useEffect } from 'react'

export default function DriverMenuVisualConsistency() {
  useEffect(() => {
    if (location.pathname !== '/driver/dashboard') return

    const styleId = 'driver-menu-visual-consistency'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        .drawer .menuSection > h3 {
          font-size:14px !important;
          font-weight:800 !important;
          line-height:1.25 !important;
          color:#0f6f59 !important;
          letter-spacing:0 !important;
        }
        .drawer .menuSection > h3 > span[aria-hidden="true"] {
          font-size:22px !important;
          line-height:1 !important;
        }
      `
      document.head.appendChild(style)
    }

    const normalize = () => {
      const drawer = document.querySelector('.drawer') as HTMLElement | null
      if (!drawer) return

      drawer.querySelectorAll<HTMLElement>('.menuSection > h3').forEach((title) => {
        const arrows = Array.from(title.querySelectorAll<HTMLElement>(':scope > span[aria-hidden="true"]'))
        arrows.slice(1).forEach((arrow) => arrow.remove())
      })
    }

    normalize()
    const observer = new MutationObserver(normalize)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
