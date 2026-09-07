'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function DriverDashboardTitleCleanup() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== '/driver/dashboard') return

    const apply = () => {
      const pageTitle = document.querySelector('main .card > h1') as HTMLElement | null
      if (pageTitle) pageTitle.style.display = 'none'

      const drawer = document.querySelector('.drawer')
      if (!drawer) return

      const profileBlock = drawer.querySelector('.profileBlock') as HTMLElement | null
      const avatar = profileBlock?.querySelector('.avatar') as HTMLElement | null
      const currentName = profileBlock?.querySelector('strong')?.textContent?.trim() || ''

      const drawerTitle = drawer.querySelector('.drawerHead strong') as HTMLElement | null
      if (drawerTitle) drawerTitle.style.display = 'none'

      if (profileBlock && avatar) {
        Array.from(profileBlock.children).forEach((child) => {
          if (child !== avatar) child.remove()
        })
        profileBlock.style.justifyContent = 'center'
      }

      const personalSection = drawer.querySelector('.menuSection') as HTMLElement | null
      if (personalSection && currentName && !personalSection.querySelector('[data-driver-name-row="true"]')) {
        const row = document.createElement('p')
        row.setAttribute('data-driver-name-row', 'true')
        const label = document.createElement('span')
        label.textContent = localStorage.getItem('taxi-language') === 'ht' ? 'Non' : 'Nom'
        const value = document.createElement('b')
        value.textContent = currentName
        row.append(label, value)
        const heading = personalSection.querySelector('h3')
        if (heading?.nextSibling) personalSection.insertBefore(row, heading.nextSibling)
        else personalSection.appendChild(row)
      }
    }

    apply()
    const observer = new MutationObserver(apply)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [pathname])

  return null
}
