'use client'

import { useEffect } from 'react'

export default function PassengerHelpDirectNavigation() {
  useEffect(() => {
    if (window.location.pathname !== '/passenger/dashboard') return

    const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    const handler = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const button = target?.closest<HTMLButtonElement>('.nav-drawer .drawer-nav > button')
      if (!button) return
      const text = normalize((button.textContent || '').trim())
      if (!(text.includes('aide') || text.includes('ed'))) return

      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      window.location.assign('/passenger/help')
    }

    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [])

  return null
}
