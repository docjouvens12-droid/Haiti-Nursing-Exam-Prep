'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
  const lastRouteAt = useRef(0)

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
        // Keep the immediate straight-line fallback when routing is unavailable.
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

    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${overlays}/auto/520x360@2x?padding=70&logo=false&attribution=false&access_token=${encodeURIComponent(token)}`
  }, [routeTarget])

  if (!tracking) return null

  const title = tracking.ride_status === 'in_progress'
    ? (ht ? 'Trajè a an kou' : 'Course en cours')
    : tracking.ride_status === 'driver_arriving'
      ? (ht ? 'Chofè a ap pwoche' : 'Le chauffeur approche')
      : (ht ? 'Chofè a aksepte demann lan' : 'Le chauffeur a accepté la course')

  const subtitle = tracking.ride_status === 'in_progress'
    ? (ht ? 'W ap wè chofè a sou wout pou destinasyon an.' : 'Suivez le chauffeur vers votre destination.')
    : (ht ? 'Kat sa a montre chofè a parapò ak kote pou pran ou.' : 'Cette carte montre le chauffeur par rapport à votre point de prise en charge.')

  const distanceLabel = metrics
    ? `${metrics.distanceKm < 10 ? metrics.distanceKm.toFixed(1) : Math.round(metrics.distanceKm)} km`
    : '—'
  const timeLabel = metrics ? `~${metrics.minutes} min` : '—'

  return (
    <div className="passenger-live-mini-map" aria-live="polite">
      <div className="passenger-live-mini-head">
        <span className="passenger-live-mini-icon">🚕</span>
        <div><strong>{title}</strong><small>{subtitle}</small></div>
      </div>
      {mapUrl ? (
        <img src={mapUrl} alt={ht ? 'Pozisyon chofè a ak pasaje a' : 'Position du chauffeur et du passager'} />
      ) : (
        <div className="passenger-live-mini-wait">{ht ? 'N ap tann pozisyon chofè a…' : 'En attente de la position du chauffeur…'}</div>
      )}
      <div className="passenger-live-mini-metrics">
        <div>
          <span>{ht ? 'Distans' : 'Distance'}</span>
          <strong>{distanceLabel}</strong>
        </div>
        <div>
          <span>{tracking.ride_status === 'in_progress'
            ? (ht ? 'Tan ki rete' : 'Temps restant')
            : (ht ? 'Chofè a rive nan' : 'Arrivée dans')}</span>
          <strong>{timeLabel}</strong>
        </div>
      </div>
      <div className="passenger-live-mini-legend">
        <span><b className="driver-dot" />{ht ? 'Chofè' : 'Chauffeur'}</span>
        <span><b className="passenger-dot" />{tracking.ride_status === 'in_progress' ? (ht ? 'Destinasyon' : 'Destination') : (ht ? 'Pasaje' : 'Passager')}</span>
      </div>
      <style>{`
        .passenger-live-mini-map{position:fixed;top:86px;right:12px;z-index:85;width:min(46vw,210px);overflow:hidden;border-radius:18px;background:#fff;border:1px solid rgba(15,128,101,.18);box-shadow:0 14px 34px rgba(17,42,34,.20);font-family:Inter,system-ui,sans-serif}
        .passenger-live-mini-head{display:flex;gap:8px;align-items:flex-start;padding:10px 11px 8px;background:#fff}
        .passenger-live-mini-icon{width:28px;height:28px;border-radius:10px;background:#eaf7f2;display:grid;place-items:center;flex:0 0 28px;font-size:15px}
        .passenger-live-mini-head strong,.passenger-live-mini-head small{display:block}.passenger-live-mini-head strong{font-size:11px;line-height:1.25;color:#10243a}.passenger-live-mini-head small{font-size:8px;line-height:1.35;color:#6c7d76;margin-top:3px}
        .passenger-live-mini-map img{display:block;width:100%;height:118px;object-fit:cover;background:#e7efec}
        .passenger-live-mini-wait{height:92px;display:grid;place-items:center;text-align:center;padding:10px;background:#eef4f2;color:#71817b;font-size:9px;font-weight:750}
        .passenger-live-mini-metrics{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #edf2f0;border-bottom:1px solid #edf2f0;background:#fff}
        .passenger-live-mini-metrics div{padding:8px 10px;min-width:0}.passenger-live-mini-metrics div+div{border-left:1px solid #edf2f0}
        .passenger-live-mini-metrics span,.passenger-live-mini-metrics strong{display:block}.passenger-live-mini-metrics span{font-size:7px;line-height:1.2;color:#76857f;font-weight:800;text-transform:uppercase;letter-spacing:.03em}.passenger-live-mini-metrics strong{margin-top:2px;font-size:12px;line-height:1.2;color:#10243a;white-space:nowrap}
        .passenger-live-mini-legend{display:flex;justify-content:space-between;gap:8px;padding:8px 10px 9px;font-size:8px;color:#52645e;font-weight:800;background:#fff}
        .passenger-live-mini-legend span{display:flex;align-items:center;gap:4px}.passenger-live-mini-legend b{width:7px;height:7px;border-radius:50%;display:inline-block}.driver-dot{background:#0f8065}.passenger-dot{background:#ef6a5b}
        @media(max-width:380px){.passenger-live-mini-map{width:184px;top:82px;right:8px}.passenger-live-mini-map img{height:108px}}
      `}</style>
    </div>
  )
}
