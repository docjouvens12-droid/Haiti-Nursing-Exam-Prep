'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function DriverEarningsMenuPolish() {
  useEffect(() => {
    if (window.location.pathname !== '/driver/dashboard') return

    const cleanups: Array<() => void> = []
    let applying = false

    const formatHtg = (value: number | null | undefined) => {
      if (value == null || Number.isNaN(value)) return '—'
      return `${new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 0 }).format(value)} HTG`
    }

    const removeDuplicateSections = (drawer: HTMLElement) => {
      const sections = Array.from(drawer.querySelectorAll<HTMLElement>('[data-driver-earnings="true"]'))
      sections.slice(1).forEach((section) => section.remove())
      return sections[0] ?? null
    }

    const apply = async () => {
      const drawer = document.querySelector('.drawer') as HTMLElement | null
      if (!drawer) return

      const existing = removeDuplicateSections(drawer)
      if (existing || applying) return
      applying = true

      try {
        const { data: auth } = await supabase.auth.getUser()
        const user = auth.user
        if (!user || !drawer.isConnected) return

        // Another observer pass may have completed while the data request was running.
        if (removeDuplicateSections(drawer)) return

        const lang = localStorage.getItem('taxi-language') === 'ht' ? 'ht' : 'fr'
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

        const [{ data: latestCompleted }, { data: completedRides }, { data: weeklyRides }] = await Promise.all([
          supabase
            .from('rides')
            .select('final_fare_htg,completed_at')
            .eq('driver_id', user.id)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('rides')
            .select('id')
            .eq('driver_id', user.id)
            .eq('status', 'completed'),
          supabase
            .from('rides')
            .select('final_fare_htg')
            .eq('driver_id', user.id)
            .eq('status', 'completed')
            .gte('completed_at', sevenDaysAgo),
        ])

        if (!drawer.isConnected || removeDuplicateSections(drawer)) return

        const latestFare = latestCompleted?.final_fare_htg != null ? Number(latestCompleted.final_fare_htg) : null
        const rideCount = completedRides?.length ?? 0
        const weeklyRevenue = (weeklyRides ?? []).reduce((sum, ride) => sum + Number(ride.final_fare_htg ?? 0), 0)

        const section = document.createElement('div')
        section.className = 'menuSection'
        section.dataset.driverEarnings = 'true'

        const title = document.createElement('h3')
        title.textContent = lang === 'ht' ? 'Revni' : 'Revenus'
        Object.assign(title.style, {
          display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
          padding: '4px 0', marginBottom: '0', userSelect: 'none'
        })
        title.setAttribute('role', 'button')
        title.setAttribute('tabindex', '0')
        title.setAttribute('aria-expanded', 'false')

        const arrow = document.createElement('span')
        arrow.textContent = '›'
        arrow.setAttribute('aria-hidden', 'true')
        Object.assign(arrow.style, {
          marginLeft: 'auto', fontSize: '22px', lineHeight: '1', transition: 'transform .18s ease'
        })
        title.appendChild(arrow)

        const makeRow = (label: string, value: string) => {
          const row = document.createElement('p')
          const left = document.createElement('span')
          const right = document.createElement('b')
          left.textContent = `${label}: `
          right.textContent = value
          row.append(left, right)
          return row
        }

        const rows = [
          makeRow(lang === 'ht' ? 'Salè pa trajè' : 'Revenu du dernier trajet', formatHtg(latestFare)),
          makeRow(lang === 'ht' ? 'Kantite trajè' : 'Nombre de trajets', String(rideCount)),
          makeRow(lang === 'ht' ? 'Revni pa semèn' : 'Revenu sur 7 jours', formatHtg(weeklyRevenue)),
        ]

        section.append(title, ...rows)

        const languageSection = Array.from(drawer.querySelectorAll('.menuSection')).find((el) => {
          const h = el.querySelector('h3')?.textContent?.toLowerCase() || ''
          return h.includes('lang')
        })
        if (languageSection) drawer.insertBefore(section, languageSection)
        else {
          const logout = drawer.querySelector('.drawerLogout')
          if (logout) drawer.insertBefore(section, logout)
          else drawer.appendChild(section)
        }

        let open = false
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
          if (ke.key === 'Enter' || ke.key === ' ') { e.preventDefault(); toggle() }
        }
        title.addEventListener('click', toggle)
        title.addEventListener('keydown', keyToggle)
        cleanups.push(() => {
          title.removeEventListener('click', toggle)
          title.removeEventListener('keydown', keyToggle)
        })
        setOpen(false)
        removeDuplicateSections(drawer)
      } finally {
        applying = false
      }
    }

    void apply()
    const observer = new MutationObserver(() => {
      const drawer = document.querySelector('.drawer') as HTMLElement | null
      if (drawer) removeDuplicateSections(drawer)
      void apply()
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      cleanups.forEach((fn) => fn())
    }
  }, [])

  return null
}
