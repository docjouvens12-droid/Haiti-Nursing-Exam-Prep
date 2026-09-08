'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function DriverEarningsMenuPolish() {
  useEffect(() => {
    if (window.location.pathname !== '/driver/dashboard') return

    const cleanups: Array<() => void> = []
    let applying = false
    let driverId = ''

    const formatHtg = (value: number | null | undefined) => {
      if (value == null || Number.isNaN(value)) return '—'
      return `${new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 0 }).format(value)} HTG`
    }

    const removeDuplicateSections = (drawer: HTMLElement) => {
      const sections = Array.from(drawer.querySelectorAll<HTMLElement>('[data-driver-earnings="true"]'))
      sections.slice(1).forEach((section) => section.remove())
      return sections[0] ?? null
    }

    const getEarnings = async (userId: string) => {
      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const [{ data: latestCompleted }, { data: completedRides }, { data: todayRides }, { data: weeklyRides }] = await Promise.all([
        supabase
          .from('rides')
          .select('final_fare_htg,completed_at')
          .eq('driver_id', userId)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('rides')
          .select('id')
          .eq('driver_id', userId)
          .eq('status', 'completed'),
        supabase
          .from('rides')
          .select('id,final_fare_htg')
          .eq('driver_id', userId)
          .eq('status', 'completed')
          .gte('completed_at', startOfToday),
        supabase
          .from('rides')
          .select('final_fare_htg')
          .eq('driver_id', userId)
          .eq('status', 'completed')
          .gte('completed_at', sevenDaysAgo),
      ])

      return {
        latestFare: latestCompleted?.final_fare_htg != null ? Number(latestCompleted.final_fare_htg) : null,
        rideCount: completedRides?.length ?? 0,
        todayRideCount: todayRides?.length ?? 0,
        todayRevenue: (todayRides ?? []).reduce((sum, ride) => sum + Number(ride.final_fare_htg ?? 0), 0),
        weeklyRevenue: (weeklyRides ?? []).reduce((sum, ride) => sum + Number(ride.final_fare_htg ?? 0), 0),
      }
    }

    const refreshVisibleEarnings = async () => {
      if (!driverId) return
      const drawer = document.querySelector('.drawer') as HTMLElement | null
      if (!drawer) return
      const section = removeDuplicateSections(drawer)
      if (!section) return

      const values = await getEarnings(driverId)
      if (!section.isConnected) return

      const latest = section.querySelector<HTMLElement>('[data-earning-value="latest"]')
      const count = section.querySelector<HTMLElement>('[data-earning-value="count"]')
      const todayCount = section.querySelector<HTMLElement>('[data-earning-value="today-count"]')
      const today = section.querySelector<HTMLElement>('[data-earning-value="today"]')
      const weekly = section.querySelector<HTMLElement>('[data-earning-value="weekly"]')
      if (latest) latest.textContent = formatHtg(values.latestFare)
      if (count) count.textContent = String(values.rideCount)
      if (todayCount) todayCount.textContent = String(values.todayRideCount)
      if (today) today.textContent = formatHtg(values.todayRevenue)
      if (weekly) weekly.textContent = formatHtg(values.weeklyRevenue)
    }

    const apply = async () => {
      const drawer = document.querySelector('.drawer') as HTMLElement | null
      if (!drawer) return

      const existing = removeDuplicateSections(drawer)
      if (existing) {
        void refreshVisibleEarnings()
        return
      }
      if (applying) return
      applying = true

      try {
        const { data: auth } = await supabase.auth.getUser()
        const user = auth.user
        if (!user || !drawer.isConnected) return
        driverId = user.id

        if (removeDuplicateSections(drawer)) return

        const lang = localStorage.getItem('taxi-language') === 'ht' ? 'ht' : 'fr'
        const values = await getEarnings(user.id)
        if (!drawer.isConnected || removeDuplicateSections(drawer)) return

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

        const makeRow = (label: string, value: string, key: 'latest' | 'count' | 'today-count' | 'today' | 'weekly') => {
          const row = document.createElement('p')
          const left = document.createElement('span')
          const right = document.createElement('b')
          left.textContent = `${label}: `
          right.textContent = value
          right.dataset.earningValue = key
          row.append(left, right)
          return row
        }

        const rows = [
          makeRow(lang === 'ht' ? 'Salè pa trajè' : 'Revenu du dernier trajet', formatHtg(values.latestFare), 'latest'),
          makeRow(lang === 'ht' ? 'Kantite trajè total' : 'Nombre total de trajets', String(values.rideCount), 'count'),
          makeRow(lang === 'ht' ? 'Trajè jodi a' : "Trajets aujourd’hui", String(values.todayRideCount), 'today-count'),
          makeRow(lang === 'ht' ? 'Revni jodi a' : "Revenu aujourd’hui", formatHtg(values.todayRevenue), 'today'),
          makeRow(lang === 'ht' ? 'Revni pa semèn' : 'Revenu sur 7 jours', formatHtg(values.weeklyRevenue), 'weekly'),
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
          if (next) void refreshVisibleEarnings()
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

    const setupRealtime = async () => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) return
      driverId = auth.user.id

      const channel = supabase
        .channel(`driver-earnings-${driverId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'rides', filter: `driver_id=eq.${driverId}` },
          (payload) => {
            const next = payload.new as { status?: string }
            const previous = payload.old as { status?: string }
            if (next?.status === 'completed' || previous?.status === 'completed') {
              window.setTimeout(() => { void refreshVisibleEarnings() }, 250)
            }
          }
        )
        .subscribe()

      cleanups.push(() => { void supabase.removeChannel(channel) })
    }

    void setupRealtime()
    void apply()

    const observer = new MutationObserver(() => {
      const drawer = document.querySelector('.drawer') as HTMLElement | null
      if (drawer) removeDuplicateSections(drawer)
      void apply()
    })
    observer.observe(document.body, { childList: true, subtree: true })

    const fallbackRefresh = window.setInterval(() => { void refreshVisibleEarnings() }, 15000)
    const onVisible = () => { if (document.visibilityState === 'visible') void refreshVisibleEarnings() }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      observer.disconnect()
      window.clearInterval(fallbackRefresh)
      document.removeEventListener('visibilitychange', onVisible)
      cleanups.forEach((fn) => fn())
    }
  }, [])

  return null
}
