'use client'

import { useEffect } from 'react'

export default function DriverMenuPersonalInfoCleanup() {
  useEffect(() => {
    if (!location.pathname.startsWith('/driver')) return

    const apply = () => {
      const drawer = document.querySelector('.drawer')
      if (!drawer) return

      const profile = drawer.querySelector('.profileBlock')
      const profileText = profile?.querySelector('div:last-child')
      const name = profileText?.querySelector('strong')?.textContent?.trim() || ''

      if (profileText) {
        profileText.querySelectorAll('span').forEach((el) => el.remove())
      }

      const personal = drawer.querySelector('.menuSection')
      if (!personal || !name) return

      const existing = personal.querySelector('[data-driver-name-row="true"]')
      if (existing) return

      const row = document.createElement('p')
      row.setAttribute('data-driver-name-row', 'true')
      const label = document.createElement('span')
      label.textContent = localStorage.getItem('taxi-language') === 'ht' ? 'Non' : 'Nom'
      const value = document.createElement('b')
      value.textContent = name
      row.append(label, value)
      personal.insertBefore(row, personal.children[1] || null)
    }

    apply()
    const observer = new MutationObserver(apply)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
