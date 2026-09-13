'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'

type Tracking = {
  ride_id: string
  ride_status: 'accepted' | 'driver_arriving' | 'in_progress'
  driver_id: string
  driver_latitude: number | null
  driver_longitude: number | null
  pickup_latitude: number | null
  pickup_longitude: number | null
  destination_latitude: number | null
  destination_longitude: number | null
}

type RouteMetrics = {
  distanceKm: number
  minutes: number
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const r = 6371
  const toRad = (value: number) => value * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function findTopMapTarget() {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>('div,section,p,span,strong'))
  const placeholder = candidates.find((el) => {
    const text = (el.textContent || '').trim().toLowerCase()
    return text === 'carte temporairement indisponible'
      || text === 'kat la pa disponib pou kounye a'
      || text === 'map temporarily unavailable'
  })

  if (placeholder?.parentElement) return placeholder.parentElement as HTMLElement
  return document.querySelector<HTMLElement>('.shell .booking-sheet')
}

export default function PassengerAcceptedRideMiniMap() {
  const [tracking, setTracking] = useState<Tracking | null>(null)
  const [metrics, setMetrics] = useState<RouteMetrics | null>(null)
  const [ht, setHt] = useState(false)
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const lastRouteAt = useRef(0)

  useEffect(() => {
    const findTarget = () => setTarget(findTopMapTarget())
    findTarget()
    const timer = window.setInterval(findTarget, 700)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let alive = true

    const syncLang = () => setHt(window.localStorage.getItem('taxi-language') === 'ht')
    syncLang()

    async function load() {
      const { data, error } = await supabase.rpc('get_passenger_live_driver_tracking')
      if (!alive) return
      if (error) {
        setTracking(null)
        return
      }
      const row = (Array.isArray(data) ? data[0] : data) as Tracking | undefined
      setTracking(row ?? null)
    }

    void load()
    const timer = window.setInterval(() => void load(), 1500)
    const onStorage = () => syncLang()
    window.addEventListener('storage', onStorage)

    return () => {
      alive = false
      window.clearInterval(timer)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const routeTarget = useMemo(() => {
    if (!tracking) return null

    const dLat = tracking.driver_latitude
    const dLng = tracking.driver_longitude
    const targetLat = tracking.ride_status === 'in_progress'
      ? tracking.destination_latitude
      : tracking.pickup_latitude
    const targetLng = tracking.ride_status === 'in_progress'
      ? tracking.destination_longitude
      : tracking.pickup_longitude

    if (dLat == null || dLng == null || targetLat == null || targetLng == null) return null
    return { dLat, dLng, targetLat, targetLng }
  }, [tracking])

  useEffect(() => {
    if (!routeTarget) {
      setMetrics(null)
      return
    }

    const { dLat, dLng, targetLat, targetLng } = routeTarget
    const fallbackDistance = haversineKm(dLat, dLng, targetLat, targetLng)
    setMetrics({
      distanceKm: fallbackDistance,
      minutes: Math.max(1, Math.ceil(fallbackDistance * 3.2)),
    })

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    const now = Date.now()
    if (!token || now - lastRouteAt.current < 8000) return
    lastRouteAt.current = now

    let cancelled = false
    const controller = new AbortController()

    async function loadRoadMetrics() {
      try {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${dLng},${dLat};${targetLng},${targetLat}?overview=false&steps=false&access_token=${encodeURIComponent(token ?? '')}`
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) return
        const json = await response.json()
        const route = json?.routes?.[0]
        if (cancelled || !route || !Number.isFinite(route.distance) || !Number.isFinite(route.duration)) return
        setMetrics({
          distanceKm: route.distance / 1000,
          minutes: Math.max(1, Math.ceil(route.duration / 60)),
        })
      } catch {
        // Keep the immediate fallback when routing is unavailable.
      }
    }

    void loadRoadMetrics()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [routeTarget])

  const mapUrl = useMemo(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token || !routeTarget) return ''

    const { dLat, dLng, targetLat, targetLng } = routeTarget
    const overlays = [
      `pin-s-d+0f8065(${dLng},${dLat})`,
      `pin-s-p+ef6a5b(${targetLng},${targetLat})`,
    ].join(',')

    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${overlays}/auto/760x420@2x?padding=90&logo=false&attribution=false&access_token=${encodeURIComponent(token)}`
  }, [routeTarget])

  useEffect(() => {
    if (!target) return
    const placeholders = Array.from(target.querySelectorAll<HTMLElement>('div,p,span,strong')).filter((el) => {
      const text = (el.textContent || '').trim().toLowerCase()
      return text === 'carte temporairement indisponible'
        || text === 'kat la pa disponib pou kounye a'
        || text === 'map temporarily unavailable'
    })
    const shouldHide = !!tracking && (tracking.ride_status === 'accepted' || tracking.ride_status === 'in_progress')
    placeholders.forEach((el) => {
      el.style.display = shouldHide ? 'none' : ''
    })
    return () => placeholders.forEach((el) => { el.style.display = '' })
  }, [target, tracking])

  if (!tracking || tracking.ride_status === 'driver_arriving' || !target || !document.contains(target)) return null

  const inProgress = tracking.ride_status === 'in_progress'
  const title = inProgress
    ? (ht ? 'Trajè a kòmanse' : 'La course a commencé')
    : (ht ? 'Chofè a sou wout pou ou' : 'Votre chauffeur est en route')
  const subtitle = inProgress
    ? (ht ? 'Swiv chofè a pandan l ap mennen ou nan destinasyon an.' : 'Suivez le chauffeur pendant le trajet vers votre destination.')
    : (ht ? 'Swiv chofè a pandan l ap vini pran ou.' : 'Suivez le chauffeur pendant son approche.')
  const distanceLabel = metrics
    ? `${metrics.distanceKm < 10 ? metrics.distanceKm.toFixed(1) : Math.round(metrics.distanceKm)} km`
    : '—'
  const timeLabel = metrics ? `~${metrics.minutes} min` : '—'

  return createPortal(
    <section className="passenger-live-top-map" aria-live="polite">
      <style>{`
        .passenger-live-top-map{width:100%;max-width:100%;overflow:hidden;background:#eef5f2;border-radius:0;font-family:Inter,system-ui,sans-serif;box-shadow:none}
        .passenger-live-top-map-head{display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,.96);border-bottom:1px solid #e2ebe7}
        .passenger-live-top-map-icon{width:36px;height:36px;border-radius:12px;background:#e6f5ef;display:grid;place-items:center;font-size:18px;flex:0 0 36px}
        .passenger-live-top-map-copy{min-width:0;flex:1}.passenger-live-top-map-copy strong{display:block;color:#10243a;font-size:14px;line-height:1.2;font-weight:900}.passenger-live-top-map-copy small{display:block;margin-top:2px;color:#6d7e77;font-size:9px;line-height:1.3;font-weight:650}
        .passenger-live-top-map-live{display:flex;align-items:center;gap:5px;padding:5px 8px;border-radius:999px;background:#eaf7f2;color:#0f8065;font-size:8px;font-weight:900;letter-spacing:.05em}.passenger-live-top-map-live:before{content:'';width:6px;height:6px;border-radius:50%;background:#0f8065}
        .passenger-live-top-map-frame{position:relative;background:#e8efec}.passenger-live-top-map-frame img{display:block;width:100%;height:225px;object-fit:cover}
        .passenger-live-top-map-pills{position:absolute;left:14px;right:14px;bottom:12px;display:flex;justify-content:space-between;gap:10px}.passenger-live-top-map-pill{display:flex;align-items:center;gap:6px;padding:7px 11px;border-radius:999px;background:rgba(255,255,255,.94);box-shadow:0 5px 14px rgba(15,35,29,.12);font-size:9px;font-weight:900;color:#334a42}.passenger-live-top-map-pill b{width:8px;height:8px;border-radius:50%;display:inline-block}.passenger-live-top-map-pill .driver-dot{background:#0f8065}.passenger-live-top-map-pill .passenger-dot{background:#ef6a5b}
        .passenger-live-top-map-metrics{display:grid;grid-template-columns:1fr 1fr;background:#fff;border-top:1px solid #edf2f0}.passenger-live-top-map-metric{padding:11px 16px}.passenger-live-top-map-metric+.passenger-live-top-map-metric{border-left:1px solid #edf2f0}.passenger-live-top-map-metric span,.passenger-live-top-map-metric strong{display:block}.passenger-live-top-map-metric span{font-size:8px;color:#76857f;font-weight:900;text-transform:uppercase;letter-spacing:.06em}.passenger-live-top-map-metric strong{margin-top:3px;color:#10243a;font-size:18px;line-height:1;font-weight:950}
        .passenger-live-top-map-loading{height:225px;display:grid;place-items:center;background:linear-gradient(180deg,#eaf2ef,#f4f8f6);color:#62766f;font-size:11px;font-weight:800;text-align:center;padding:20px}
      `}</style>

      <div className="passenger-live-top-map-head">
        <span className="passenger-live-top-map-icon">🚕</span>
        <div className="passenger-live-top-map-copy">
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </div>
        <span className="passenger-live-top-map-live">LIVE</span>
      </div>

      {mapUrl ? (
        <div className="passenger-live-top-map-frame">
          <img src={mapUrl} alt={inProgress ? (ht ? 'Pozisyon chofè a ak destinasyon an' : 'Position du chauffeur et de la destination') : (ht ? 'Pozisyon chofè a ak pasaje a' : 'Position du chauffeur et du passager')} />
          <div className="passenger-live-top-map-pills">
            <span className="passenger-live-top-map-pill"><b className="driver-dot" />{ht ? 'Chofè' : 'Chauffeur'}</span>
            <span className="passenger-live-top-map-pill"><b className="passenger-dot" />{inProgress ? (ht ? 'Destinasyon' : 'Destination') : (ht ? 'Ou' : 'Vous')}</span>
          </div>
        </div>
      ) : (
        <div className="passenger-live-top-map-loading">{ht ? 'N ap chaje pozisyon chofè a…' : 'Chargement de la position du chauffeur…'}</div>
      )}

      <div className="passenger-live-top-map-metrics">
        <div className="passenger-live-top-map-metric">
          <span>{inProgress ? (ht ? 'Distans ki rete' : 'Distance restante') : (ht ? 'Distans' : 'Distance')}</span>
          <strong>{distanceLabel}</strong>
        </div>
        <div className="passenger-live-top-map-metric">
          <span>{inProgress ? (ht ? 'Tan ki rete' : 'Temps restant') : (ht ? 'Chofè a rive nan' : 'Arrivée dans')}</span>
          <strong>{timeLabel}</strong>
        </div>
      </div>
    </section>,
    target,
  )
}
