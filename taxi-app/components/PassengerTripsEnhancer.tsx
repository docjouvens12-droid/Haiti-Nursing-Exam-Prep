'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'

type Ride = {
  id: string
  status: string
  pickup_address: string
  destination_address: string
  final_fare_htg: number | null
  estimated_fare_htg: number | null
  requested_at: string
}

type Filter = 'all' | 'completed' | 'cancelled'

function label(status: string, ht: boolean) {
  if (status === 'completed') return ht ? 'Fini' : 'Terminé'
  if (status === 'cancelled') return ht ? 'Anile' : 'Annulé'
  if (status === 'in_progress') return ht ? 'An kou' : 'En cours'
  if (status === 'driver_arriving') return ht ? 'Chofè rive' : 'Chauffeur arrivé'
  if (status === 'accepted') return ht ? 'Chofè aksepte' : 'Chauffeur accepté'
  if (status === 'requested') return ht ? 'N ap chèche chofè' : 'Recherche chauffeur'
  return status
}

export default function PassengerTripsEnhancer() {
  const [target, setTarget] = useState<Element | null>(null)
  const [open, setOpen] = useState(false)
  const [rides, setRides] = useState<Ride[]>([])
  const [busy, setBusy] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [expandedRide, setExpandedRide] = useState<string | null>(null)
  const [lang, setLang] = useState<'fr' | 'ht'>('fr')

  useEffect(() => {
    let currentButton: HTMLButtonElement | null = null
    let currentHandler: ((event: MouseEvent) => void) | null = null

    const syncTarget = () => {
      const drawer = document.querySelector('.nav-drawer')
      if (!drawer) {
        setTarget(null)
        setOpen(false)
        return
      }

      const buttons = Array.from(drawer.querySelectorAll<HTMLButtonElement>('.drawer-nav > button'))
      const ridesButton = buttons.find((button) => {
        const text = (button.textContent || '').toLowerCase()
        return text.includes('mes trajets') || text.includes('trajè mwen yo')
      }) || null

      if (!ridesButton) {
        setTarget(null)
        setOpen(false)
        return
      }

      if (currentButton !== ridesButton) {
        if (currentButton && currentHandler) currentButton.removeEventListener('click', currentHandler, true)
        currentButton = ridesButton
        currentHandler = (event: MouseEvent) => {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          const saved = window.localStorage.getItem('taxi-language')
          setLang(saved === 'ht' ? 'ht' : 'fr')
          setOpen((value) => !value)
          setExpandedRide(null)
        }
        ridesButton.addEventListener('click', currentHandler, true)
      }

      let mount = drawer.querySelector('.drawer-trips-inline-target') as HTMLElement | null
      if (!mount) {
        mount = document.createElement('div')
        mount.className = 'drawer-trips-inline-target'
        ridesButton.insertAdjacentElement('afterend', mount)
      }
      setTarget(mount)
    }

    syncTarget()
    const observer = new MutationObserver(syncTarget)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      if (currentButton && currentHandler) currentButton.removeEventListener('click', currentHandler, true)
    }
  }, [])

  useEffect(() => {
    if (!target || !open) return
    let active = true
    const load = async () => {
      setBusy(true)
      try {
        const { data } = await supabase
          .from('rides')
          .select('id,status,pickup_address,destination_address,final_fare_htg,estimated_fare_htg,requested_at')
          .order('requested_at', { ascending: false })
          .limit(30)
        if (active) setRides((data ?? []) as Ride[])
      } finally {
        if (active) setBusy(false)
      }
    }
    void load()
    return () => { active = false }
  }, [target, open])

  const shown = useMemo(() => rides.filter((r) => filter === 'all' || r.status === filter), [rides, filter])
  const completed = rides.filter((r) => r.status === 'completed').length
  const cancelled = rides.filter((r) => r.status === 'cancelled').length

  if (!target || !open) return null
  const ht = lang === 'ht'

  return createPortal(
    <section className="drawer-trips-inline">
      <div className="drawer-trips-inline-head">
        <strong>{ht ? 'Trajè mwen yo' : 'Mes trajets'}</strong>
        <button type="button" onClick={() => { setOpen(false); setExpandedRide(null) }}>{ht ? 'Fèmen' : 'Fermer'}</button>
      </div>

      <div className="drawer-trips-summary">
        <div><strong>{rides.length}</strong><span>{ht ? 'Tout' : 'Tous'}</span></div>
        <div><strong>{completed}</strong><span>{ht ? 'Fini' : 'Terminés'}</span></div>
        <div><strong>{cancelled}</strong><span>{ht ? 'Anile' : 'Annulés'}</span></div>
      </div>

      <div className="drawer-trips-tabs">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>{ht ? 'Tout' : 'Tous'}</button>
        <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>{ht ? 'Fini' : 'Terminés'}</button>
        <button className={filter === 'cancelled' ? 'active' : ''} onClick={() => setFilter('cancelled')}>{ht ? 'Anile' : 'Annulés'}</button>
      </div>

      {busy ? <div className="drawer-trips-state">{ht ? 'N ap chaje trajè yo…' : 'Chargement…'}</div> : shown.length === 0 ? (
        <div className="drawer-trips-state">🚕 {ht ? 'Pa gen trajè.' : 'Aucun trajet.'}</div>
      ) : (
        <div className="drawer-trips-list">
          {shown.slice(0, 10).map((ride) => {
            const detailOpen = expandedRide === ride.id
            const fare = Number(ride.final_fare_htg ?? ride.estimated_fare_htg ?? 0)
            return <article className="drawer-trip-card" key={ride.id}>
              <div className="drawer-trip-top">
                <time>{new Date(ride.requested_at).toLocaleDateString(ht ? 'fr-HT' : 'fr-FR', { day: '2-digit', month: 'short' })}</time>
                <span>{label(ride.status, ht)}</span>
              </div>
              <div className="drawer-trip-route">
                <strong>{ride.pickup_address}</strong>
                <b>→</b>
                <strong>{ride.destination_address}</strong>
              </div>
              <div className="drawer-trip-bottom">
                <strong>{fare.toLocaleString('fr-FR')} HTG</strong>
                <button type="button" onClick={() => setExpandedRide(detailOpen ? null : ride.id)}>{detailOpen ? (ht ? 'Fèmen' : 'Fermer') : (ht ? 'Detay' : 'Détails')}</button>
              </div>
              {detailOpen && <div className="drawer-trip-details">
                <div><span>{ht ? 'Nimewo' : 'N°'}</span><b>#{ride.id.slice(0, 8).toUpperCase()}</b></div>
                <div><span>{ht ? 'Dat/lè' : 'Date/heure'}</span><b>{new Date(ride.requested_at).toLocaleString(ht ? 'fr-HT' : 'fr-FR')}</b></div>
                <div><span>{ht ? 'Peman' : 'Paiement'}</span><b>{ht ? 'Lajan kach' : 'Espèces'}</b></div>
              </div>}
            </article>
          })}
        </div>
      )}
    </section>,
    target,
  )
}
