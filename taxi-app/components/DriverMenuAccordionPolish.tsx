'use client'

import { useEffect } from 'react'

export default function DriverMenuAccordionPolish() {
  useEffect(() => {
    if (location.pathname !== '/driver/dashboard') return

    const cleanups: Array<() => void> = []

    const apply = () => {
      const drawer = document.querySelector('.drawer') as HTMLElement | null
      if (!drawer || drawer.dataset.accordionPolished === 'true') return
      drawer.dataset.accordionPolished = 'true'

      // Keep only the close button in the drawer header.
      const head = drawer.querySelector('.drawerHead') as HTMLElement | null
      const headTitle = head?.querySelector('strong') as HTMLElement | null
      if (headTitle) headTitle.style.display = 'none'
      if (head) head.style.justifyContent = 'flex-end'

      // Profile summary stays compact: name/avatar only.
      const profile = drawer.querySelector('.profileBlock') as HTMLElement | null
      const profileText = profile?.querySelector('div:last-child') as HTMLElement | null
      profileText?.querySelectorAll('span').forEach((el) => {
        ;(el as HTMLElement).style.display = 'none'
      })

      const sections = Array.from(drawer.querySelectorAll('.menuSection')) as HTMLElement[]
      sections.forEach((section) => {
        const title = section.querySelector('h3') as HTMLElement | null
        if (!title) return
        const label = (title.textContent || '').trim().toLowerCase()
        const isPersonal = label.includes('person') || label.includes('pèson')
        const isVehicle = label.includes('véhic') || label.includes('veyikil') || label === 'vehicle'
        if (!isPersonal && !isVehicle) return

        const rows = Array.from(section.children).filter((el) => el !== title) as HTMLElement[]
        let open = false

        const arrow = document.createElement('span')
        arrow.textContent = '›'
        arrow.setAttribute('aria-hidden', 'true')
        Object.assign(arrow.style, {
          marginLeft: 'auto',
          fontSize: '22px',
          lineHeight: '1',
          transition: 'transform .18s ease',
        })

        Object.assign(title.style, {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          padding: '4px 0',
          marginBottom: '0',
          userSelect: 'none',
        })
        title.setAttribute('role', 'button')
        title.setAttribute('tabindex', '0')
        title.setAttribute('aria-expanded', 'false')
        title.appendChild(arrow)

        const setOpen = (next: boolean) => {
          open = next
          rows.forEach((row) => { row.style.display = next ? '' : 'none' })
          arrow.style.transform = next ? 'rotate(90deg)' : 'rotate(0deg)'
          title.setAttribute('aria-expanded', String(next))
          section.style.paddingBottom = next ? '16px' : '12px'
        }

        const toggle = () => setOpen(!open)
        const keyToggle = (e: Event) => {
          const ke = e as KeyboardEvent
          if (ke.key === 'Enter' || ke.key === ' ') {
            e.preventDefault()
            toggle()
          }
        }

        title.addEventListener('click', toggle)
        title.addEventListener('keydown', keyToggle)
        cleanups.push(() => {
          title.removeEventListener('click', toggle)
          title.removeEventListener('keydown', keyToggle)
        })
        setOpen(false)
      })
    }

    apply()
    const observer = new MutationObserver(() => apply())
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      cleanups.forEach((fn) => fn())
    }
  }, [])

  return null
}
