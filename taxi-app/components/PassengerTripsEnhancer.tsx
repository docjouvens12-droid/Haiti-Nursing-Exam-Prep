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
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [rides, setRides] = useState<Ride[]>([])
  const [busy, setBusy] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [lang, setLang] = useState<'fr' | 'ht'>('fr')

  useEffect(() => {
    const saved = window.localStorage.getItem('taxi-language')
    if (saved === 'ht') setLang('ht')

    const scan = () => {
      const panels = [...document.querySelectorAll<HTMLElement>('.account-panel')]
      const ridesPanel = panels.find((panel) => {
        const text = panel.textContent || ''
        return text.includes('Mes trajets') || text.includes('Trajè mwen yo')
      })
      if (!ridesPanel) {
        setHost(null)
        return
      }
      let target = ridesPanel.querySelector<HTMLElement>('[data-passenger-trips-host]')
      if (!target) {
        const oldBody = ridesPanel.querySelector<HTMLElement>('.panel-body')
        if (oldBody) oldBody.style.display = 'none'
        target = document.createElement('div')
        target.dataset.passengerTripsHost = 'true'
        ridesPanel.appendChild(target)
      }
      setHost(target)
    }

    scan()
    const observer = new MutationObserver(scan)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!host) return
    let active = true
    setBusy(true)
    supabase
      .from('rides')
      .select('id,status,pickup_address,destination_address,final_fare_htg,estimated_fare_htg,requested_at')
      .order('requested_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (active) setRides((data ?? []) as Ride[])
      })
      .finally(() => active && setBusy(false))
    return () => { active = false }
  }, [host])

  const shown = useMemo(() => rides.filter((r) => filter === 'all' || r.status === filter), [rides, filter])
  const completed = rides.filter((r) => r.status === 'completed').length
  const cancelled = rides.filter((r) => r.status === 'cancelled').length

  if (!host) return null
  const ht = lang === 'ht'

  return createPortal(
    <div className="pt-page">
      <div className="pt-summary">
        <div><strong>{rides.length}</strong><span>{ht ? 'Tout trajè' : 'Tous les trajets'}</span></div>
        <div><strong>{completed}</strong><span>{ht ? 'Fini' : 'Terminés'}</span></div>
        <div><strong>{cancelled}</strong><span>{ht ? 'Anile' : 'Annulés'}</span></div>
      </div>

      <div className="pt-tabs" role="tablist">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>{ht ? 'Tout' : 'Tous'}</button>
        <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>{ht ? 'Fini' : 'Terminés'}</button>
        <button className={filter === 'cancelled' ? 'active' : ''} onClick={() => setFilter('cancelled')}>{ht ? 'Anile' : 'Annulés'}</button>
      </div>

      {busy ? <div className="pt-loading">{ht ? 'N ap chaje trajè yo…' : 'Chargement des trajets…'}</div> : shown.length === 0 ? (
        <div className="pt-empty">🚕<strong>{ht ? 'Pa gen trajè nan kategori sa a.' : 'Aucun trajet dans cette catégorie.'}</strong></div>
      ) : (
        <div className="pt-list">
          {shown.map((ride) => {
            const open = expanded === ride.id
            const fare = Number(ride.final_fare_htg ?? ride.estimated_fare_htg ?? 0)
            return <article className="pt-card" key={ride.id}>
              <div className="pt-card-top">
                <time>{new Date(ride.requested_at).toLocaleDateString(ht ? 'fr-HT' : 'fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</time>
                <span className={`pt-status ${ride.status}`}>{label(ride.status, ht)}</span>
              </div>
              <div className="pt-route">
                <div><i className="from" /><span><small>{ht ? 'Depa' : 'Départ'}</small><strong>{ride.pickup_address}</strong></span></div>
                <div><i className="to" /><span><small>{ht ? 'Destinasyon' : 'Destination'}</small><strong>{ride.destination_address}</strong></span></div>
              </div>
              <div className="pt-card-bottom">
                <div><small>{ht ? 'Pri' : 'Prix'}</small><strong>{fare.toLocaleString('fr-FR')} HTG</strong></div>
                <button onClick={() => setExpanded(open ? null : ride.id)}>{open ? (ht ? 'Fèmen' : 'Fermer') : (ht ? 'Gade detay' : 'Voir les détails')}</button>
              </div>
              {open && <div className="pt-details">
                <div><span>{ht ? 'Nimewo trajè' : 'N° trajet'}</span><b>#{ride.id.slice(0, 8).toUpperCase()}</b></div>
                <div><span>{ht ? 'Dat ak lè' : 'Date et heure'}</span><b>{new Date(ride.requested_at).toLocaleString(ht ? 'fr-HT' : 'fr-FR')}</b></div>
                <div><span>{ht ? 'Peman' : 'Paiement'}</span><b>{ht ? 'Lajan kach' : 'Espèces'}</b></div>
                <div><span>{ht ? 'Estati' : 'Statut'}</span><b>{label(ride.status, ht)}</b></div>
              </div>}
            </article>
          })}
        </div>
      )}
    </div>,
    host,
  )
}
