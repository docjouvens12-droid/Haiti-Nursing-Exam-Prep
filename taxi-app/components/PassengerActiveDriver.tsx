'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../lib/supabase'

type ActiveRideBundle = {
  ride_id: string
  ride_status: 'accepted' | 'driver_arriving' | 'in_progress'
  pickup_address: string
  destination_address: string
  pickup_latitude: number | null
  pickup_longitude: number | null
  destination_latitude: number | null
  destination_longitude: number | null
  estimated_fare_htg: number | string | null
  service_type: string | null
  driver_id: string
  driver_name: string | null
  avatar_url: string | null
  average_rating: number | string | null
  total_rides: number | null
  vehicle_type: string | null
  vehicle_make: string | null
  vehicle_model: string | null
  plate_number: string | null
  driver_latitude: number | null
  driver_longitude: number | null
}

export default function PassengerActiveDriver() {
  const pathname = usePathname()
  const [bundle, setBundle] = useState<ActiveRideBundle | null>(null)
  const [lang, setLang] = useState<'fr' | 'ht'>('fr')
  const [expanded, setExpanded] = useState(false)
  const [liveDistanceKm, setLiveDistanceKm] = useState<number | null>(null)
  const [liveEtaMin, setLiveEtaMin] = useState<number | null>(null)
  const [routeGeometry, setRouteGeometry] = useState<string | null>(null)

  useEffect(() => {
    if (pathname !== '/') return
    const saved = window.localStorage.getItem('taxi-language')
    if (saved === 'ht' || saved === 'fr') setLang(saved)

    let active = true

    async function updateLiveMetrics(row: ActiveRideBundle | null) {
      if (!row || row.driver_latitude == null || row.driver_longitude == null) {
        if (active) {
          setLiveDistanceKm(null)
          setLiveEtaMin(null)
          setRouteGeometry(null)
        }
        return
      }

      const goingToPassenger = row.ride_status !== 'in_progress'
      const targetLat = goingToPassenger ? row.pickup_latitude : row.destination_latitude
      const targetLng = goingToPassenger ? row.pickup_longitude : row.destination_longitude
      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      if (!token || targetLat == null || targetLng == null) return

      try {
        const coords = `${row.driver_longitude},${row.driver_latitude};${targetLng},${targetLat}`
        const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?overview=full&geometries=polyline&steps=false&access_token=${encodeURIComponent(token)}`)
        const json = await response.json()
        const route = json.routes?.[0]
        if (!active) return
        if (!route) {
          setLiveDistanceKm(null)
          setLiveEtaMin(null)
          setRouteGeometry(null)
          return
        }
        setLiveDistanceKm(route.distance / 1000)
        setLiveEtaMin(Math.max(1, Math.round(route.duration / 60)))
        setRouteGeometry(route.geometry ?? null)
      } catch {
        if (active) {
          setLiveDistanceKm(null)
          setLiveEtaMin(null)
          setRouteGeometry(null)
        }
      }
    }

    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      if (!active) return
      if (!userData.user) {
        setBundle(null)
        return
      }

      const { data, error } = await supabase.rpc('get_passenger_active_ride_bundle')
      if (!active) return
      if (error) {
        setBundle(null)
        return
      }

      const row = (Array.isArray(data) ? data[0] : data) as ActiveRideBundle | undefined
      const next = row ?? null
      setBundle(next)
      await updateLiveMetrics(next)
    }

    void load()
    const timer = window.setInterval(() => void load(), 2500)
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void load(), 80)
    })

    return () => {
      active = false
      window.clearInterval(timer)
      authListener.subscription.unsubscribe()
    }
  }, [pathname])

  const miniMapUrl = useMemo(() => {
    if (!bundle || !routeGeometry) return null
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token || bundle.driver_latitude == null || bundle.driver_longitude == null) return null
    const goingToPassenger = bundle.ride_status !== 'in_progress'
    const targetLat = goingToPassenger ? bundle.pickup_latitude : bundle.destination_latitude
    const targetLng = goingToPassenger ? bundle.pickup_longitude : bundle.destination_longitude
    if (targetLat == null || targetLng == null) return null

    const path = `path-5+0f7b61-0.95(${encodeURIComponent(routeGeometry)})`
    const driverPin = `pin-s-car+0f7b61(${bundle.driver_longitude},${bundle.driver_latitude})`
    const targetPin = `pin-s-marker+102033(${targetLng},${targetLat})`
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${path},${driverPin},${targetPin}/auto/600x260@2x?padding=34&access_token=${encodeURIComponent(token)}`
  }, [bundle, routeGeometry])

  if (pathname !== '/' || !bundle) return null

  const name = bundle.driver_name?.trim() || (lang === 'ht' ? 'Chofè ou' : 'Votre chauffeur')
  const initial = name.charAt(0).toUpperCase()
  const rating = Number(bundle.average_rating ?? 0).toFixed(1)
  const vehicle = [bundle.vehicle_make, bundle.vehicle_model].filter(Boolean).join(' ') || (lang === 'ht' ? 'Veyikil' : 'Véhicule')
  const fare = bundle.estimated_fare_htg == null ? '—' : `${Number(bundle.estimated_fare_htg).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} HTG`
  const distance = liveDistanceKm == null ? 'GPS…' : `${liveDistanceKm.toFixed(1)} km`
  const eta = liveEtaMin == null ? 'ETA…' : `${liveEtaMin} min`
  const status = bundle.ride_status === 'in_progress'
    ? (lang === 'ht' ? 'Sou wout pou destinasyon' : 'En route vers la destination')
    : bundle.ride_status === 'driver_arriving'
      ? (lang === 'ht' ? 'Chofè a rive' : 'Votre chauffeur est arrivé')
      : (lang === 'ht' ? 'Chofè a ap vini' : 'Votre chauffeur arrive')

  return <aside className={`activeRideCard ${expanded ? 'expanded' : ''}`} aria-live="polite">
    <div className="compactRow">
      <div className="avatar">{bundle.avatar_url ? <img src={bundle.avatar_url} alt="" /> : <span>{initial}</span>}</div>
      <div className="mainCopy">
        <div className="status">{status}</div>
        <strong>{name}</strong>
        <span>⭐ {rating} · {vehicle}</span>
      </div>
      <div className="arrival">
        <strong>{distance}</strong>
        <span>⏱ {eta}</span>
      </div>
    </div>

    {miniMapUrl && <div className="miniMap">
      <img src={miniMapUrl} alt={lang === 'ht' ? 'Trajektwa chofè a an dirèk' : 'Trajet en direct du chauffeur'} />
      <div className="mapBadge">{distance} · {eta}</div>
    </div>}

    <button className="detailsButton" type="button" onClick={() => setExpanded((v) => !v)}>
      {expanded
        ? (lang === 'ht' ? 'Fèmen detay yo ▲' : 'Masquer les détails ▲')
        : (lang === 'ht' ? 'Wè plis enfòmasyon ▼' : 'Voir les détails ▼')}
    </button>

    {expanded && <div className="details">
      <div className="detailGrid">
        <div><small>{lang === 'ht' ? 'Plak' : 'Plaque'}</small><strong>{bundle.plate_number || '—'}</strong></div>
        <div><small>{lang === 'ht' ? 'Sèvis' : 'Service'}</small><strong>{bundle.service_type || 'Standard'}</strong></div>
        <div className="wide"><small>{lang === 'ht' ? 'Pran kliyan' : 'Prise en charge'}</small><strong>{bundle.pickup_address}</strong></div>
        <div className="wide"><small>{lang === 'ht' ? 'Destinasyon' : 'Destination'}</small><strong>{bundle.destination_address}</strong></div>
        <div className="wide fare"><small>{lang === 'ht' ? 'Pri estime' : 'Prix estimé'}</small><strong>{fare}</strong></div>
      </div>
    </div>}

    <style jsx>{`
      .activeRideCard{position:fixed;left:50%;bottom:88px;transform:translateX(-50%);z-index:12050;width:min(calc(100vw - 18px),560px);max-height:72vh;overflow:auto;background:#fff;border:1px solid #dce8e3;border-radius:20px;padding:11px;box-shadow:0 14px 38px rgba(16,32,51,.24);font-family:Inter,system-ui,sans-serif;color:#102033}
      .compactRow{display:flex;align-items:center;gap:10px}.avatar{width:42px;height:42px;border-radius:50%;overflow:hidden;background:#e7f6f0;color:#0f7b61;display:grid;place-items:center;font-weight:900;flex:0 0 auto}.avatar img{width:100%;height:100%;object-fit:cover}
      .mainCopy{min-width:0;flex:1}.mainCopy strong,.mainCopy span{display:block}.mainCopy strong{font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mainCopy span{font-size:11px;color:#6f7f8f;margin-top:2px;font-weight:700}.status{font-size:9px;font-weight:900;color:#0f7b61;text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px}
      .arrival{text-align:right;flex:0 0 auto}.arrival strong,.arrival span{display:block}.arrival strong{font-size:15px;color:#0f7b61}.arrival span{font-size:11px;font-weight:800;margin-top:2px}
      .miniMap{position:relative;border-radius:16px;overflow:hidden;background:#e8eef1;min-height:145px;margin-top:10px}.miniMap img{display:block;width:100%;height:170px;object-fit:cover}.mapBadge{position:absolute;left:10px;bottom:10px;background:#102033;color:#fff;padding:7px 10px;border-radius:999px;font-size:11px;font-weight:900;box-shadow:0 4px 14px rgba(0,0,0,.18)}
      .detailsButton{width:100%;margin-top:8px;border:0;border-top:1px solid #edf2f0;background:transparent;color:#0f7b61;padding:8px 4px 1px;font-weight:900;font-size:11px;cursor:pointer}
      .details{margin-top:9px}.detailGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px}.detailGrid>div{background:#f5f8f7;border-radius:12px;padding:9px}.detailGrid .wide{grid-column:1/-1}.detailGrid small,.detailGrid strong{display:block}.detailGrid small{font-size:9px;color:#84919d}.detailGrid strong{font-size:12px;margin-top:2px}.fare strong{color:#0f7b61;font-size:14px}
      @media(max-width:600px){.activeRideCard{bottom:80px}.miniMap img{height:155px}.arrival strong{font-size:14px}}
    `}</style>
  </aside>
}
