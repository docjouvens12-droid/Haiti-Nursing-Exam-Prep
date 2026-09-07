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
      const name = drawer.querySelector('.profileBlock strong')?.textContent?.trim()
      const drawerTitle = drawer.querySelector('.drawerHead strong') as HTMLElement | null
      if (drawerTitle && name) drawerTitle.textContent = name
    }

    apply()
    const observer = new MutationObserver(apply)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [pathname])

  return null
}
