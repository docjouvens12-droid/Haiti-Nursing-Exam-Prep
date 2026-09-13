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

export default function PassengerAcceptedRideMiniMap() {
  const [tracking, setTracking] = useState<Tracking | null>(null)
  const [metrics, setMetrics] = useState<RouteMetrics | null>(null)
  const [ht, setHt] = useState(false)
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const lastRouteAt = useRef(0)

  useEffect(() => {
    const findTarget = () => setTarget(document.querySelector<HTMLElement>('.shell .booking-sheet'))
    findTarget()
    const timer = window.setInterval(findTarget, 900)
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

  if (!tracking || !target || !document.contains(target)) return null

  const title = tracking.ride_status === 'in_progress'
    ? (ht ? 'Trajè a an kou' : 'Course en cours')
    : tracking.ride_status === 'driver_arriving'
      ? (ht ? 'Chofè a ap pwoche' : 'Le chauffeur approche')
      : (ht ? 'Chofè a sou wout pou ou' : 'Votre chauffeur est en route')

  const subtitle = tracking.ride_status === 'in_progress'
    ? (ht ? 'Swiv pozisyon chofè a jouk destinasyon an.' : 'Suivez le chauffeur jusqu’à votre destination.')
    : (ht ? 'Swiv chofè a an tan reyèl pandan l ap vini pran ou.' : 'Suivez le chauffeur en temps réel pendant son approche.')

  const distanceLabel = metrics
    ? `${metrics.distanceKm < 10 ? metrics.distanceKm.toFixed(1) : Math.round(metrics.distanceKm)} km`
    : '—'
  const timeLabel = metrics ? `~${metrics.minutes} min` : '—'

  return createPortal(
    <section className="passenger-live-dashboard-map" aria-live="polite">
      <style>{`
        .passenger-live-dashboard-map{margin:12px 0 4px;overflow:hidden;border-radius:22px;background:#fff;border:1px solid #dce9e4;box-shadow:0 12px 28px rgba(17,42,34,.10);font-family:Inter,system-ui,sans-serif}
        .passenger-live-dashboard-head{display:flex;align-items:center;gap:11px;padding:14px 15px 12px;background:linear-gradient(180deg,#f7fcfa 0%,#fff 100%)}
        .passenger-live-dashboard-icon{width:42px;height:42px;border-radius:14px;background:#e6f5ef;display:grid;place-items:center;flex:0 0 42px;font-size:21px}
        .passenger-live-dashboard-copy{min-width:0;flex:1}.passenger-live-dashboard-copy strong{display:block;color:#10243a;font-size:15px;line-height:1.2;font-weight:900}.passenger-live-dashboard-copy small{display:block;margin-top:4px;color:#6d7e77;font-size:10px;line-height:1.4;font-weight:650}
        .passenger-live-dashboard-live{display:flex;align-items:center;gap:5px;padding:5px 8px;border-radius:999px;background:#eaf7f2;color:#0f8065;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap}.passenger-live-dashboard-live:before{content:'';width:6px;height:6px;border-radius:50%;background:#0f8065;box-shadow:0 0 0 3px rgba(15,128,101,.12)}
        .passenger-live-dashboard-map-frame{position:relative;background:#e8efec}.passenger-live-dashboard-map-frame img{display:block;width:100%;height:178px;object-fit:cover}.passenger-live-dashboard-wait{height:150px;display:grid;place-items:center;padding:16px;text-align:center;color:#71817b;font-size:11px;font-weight:750;background:#eef4f2}
        .passenger-live-dashboard-pills{position:absolute;left:12px;bottom:11px;right:12px;display:flex;gap:8px;justify-content:space-between;pointer-events:none}.passenger-live-dashboard-pill{display:flex;align-items:center;gap:6px;padding:7px 10px;border-radius:999px;background:rgba(255,255,255,.94);box-shadow:0 5px 14px rgba(15,35,29,.12);font-size:9px;font-weight:900;color:#334a42}.passenger-live-dashboard-pill b{width:8px;height:8px;border-radius:50%;display:inline-block}.passenger-live-dashboard-pill .driver-dot{background:#0f8065}.passenger-live-dashboard-pill .passenger-dot{background:#ef6a5b}
        .passenger-live-dashboard-metrics{display:grid;grid-template-columns:1fr 1fr;background:#fff;border-top:1px solid #edf2f0}.passenger-live-dashboard-metric{padding:13px 15px}.passenger-live-dashboard-metric+.passenger-live-dashboard-metric{border-left:1px solid #edf2f0}.passenger-live-dashboard-metric span,.passenger-live-dashboard-metric strong{display:block}.passenger-live-dashboard-metric span{font-size:8px;color:#76857f;font-weight:900;text-transform:uppercase;letter-spacing:.06em}.passenger-live-dashboard-metric strong{margin-top:4px;color:#10243a;font-size:20px;line-height:1;font-weight:950}
        @media(max-width:380px){.passenger-live-dashboard-map-frame img{height:160px}.passenger-live-dashboard-head{padding:12px}.passenger-live-dashboard-metric{padding:11px 12px}.passenger-live-dashboard-metric strong{font-size:18px}}
      `}</style>

      <div className="passenger-live-dashboard-head">
        <span className="passenger-live-dashboard-icon">🚕</span>
        <div className="passenger-live-dashboard-copy">
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </div>
        <span className="passenger-live-dashboard-live">Live</span>
      </div>

      <div className="passenger-live-dashboard-map-frame">
        {mapUrl ? (
          <img src={mapUrl} alt={ht ? 'Pozisyon chofè a ak pasaje a' : 'Position du chauffeur et du passager'} />
        ) : (
          <div className="passenger-live-dashboard-wait">{ht ? 'N ap tann pozisyon chofè a…' : 'En attente de la position du chauffeur…'}</div>
        )}
        <div className="passenger-live-dashboard-pills">
          <span className="passenger-live-dashboard-pill"><b className="driver-dot" />{ht ? 'Chofè' : 'Chauffeur'}</span>
          <span className="passenger-live-dashboard-pill"><b className="passenger-dot" />{tracking.ride_status === 'in_progress' ? (ht ? 'Destinasyon' : 'Destination') : (ht ? 'Ou' : 'Vous')}</span>
        </div>
      </div>

      <div className="passenger-live-dashboard-metrics">
        <div className="passenger-live-dashboard-metric">
          <span>{ht ? 'Distans' : 'Distance'}</span>
          <strong>{distanceLabel}</strong>
        </div>
        <div className="passenger-live-dashboard-metric">
          <span>{tracking.ride_status === 'in_progress'
            ? (ht ? 'Tan ki rete' : 'Temps restant')
            : (ht ? 'Chofè a rive nan' : 'Arrivée dans')}</span>
          <strong>{timeLabel}</strong>
        </div>
      </div>
    </section>,
    target,
  )
}
