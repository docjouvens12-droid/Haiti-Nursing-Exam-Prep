'use client'

import { useEffect, useState } from 'react'
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
  estimated_distance_km: number | string | null
  estimated_duration_min: number | null
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
  vehicle_color: string | null
  plate_number: string | null
  driver_latitude: number | null
  driver_longitude: number | null
  driver_heading: number | null
  driver_speed_kph: number | null
  location_updated_at: string | null
}

export default function PassengerActiveDriver() {
  const pathname = usePathname()
  const [bundle, setBundle] = useState<ActiveRideBundle | null>(null)
  const [email, setEmail] = useState('')
  const [lang, setLang] = useState<'fr' | 'ht'>('fr')
  const [liveDistanceKm, setLiveDistanceKm] = useState<number | null>(null)
  const [liveEtaMin, setLiveEtaMin] = useState<number | null>(null)

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
        const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?overview=false&steps=false&access_token=${encodeURIComponent(token)}`)
        const json = await response.json()
        const route = json.routes?.[0]
        if (!active) return
        if (!route) {
          setLiveDistanceKm(null)
          setLiveEtaMin(null)
          return
        }
        setLiveDistanceKm(route.distance / 1000)
        setLiveEtaMin(Math.max(1, Math.round(route.duration / 60)))
      } catch {
        if (active) {
          setLiveDistanceKm(null)
          setLiveEtaMin(null)
        }
      }
    }

    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!active) return
      if (!user) {
        setEmail('')
        setBundle(null)
        setLiveDistanceKm(null)
        setLiveEtaMin(null)
        return
      }

      setEmail(user.email ?? '')
      const { data, error } = await supabase.rpc('get_passenger_active_ride_bundle')
      if (!active) return
      if (error) {
        setBundle(null)
        setLiveDistanceKm(null)
        setLiveEtaMin(null)
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
    const onStorage = () => {
      const next = window.localStorage.getItem('taxi-language')
      if (next === 'ht' || next === 'fr') setLang(next)
    }
    window.addEventListener('storage', onStorage)

    return () => {
      active = false
      window.clearInterval(timer)
      authListener.subscription.unsubscribe()
      window.removeEventListener('storage', onStorage)
    }
  }, [pathname])

  if (pathname !== '/' || !bundle) return null

  const status = bundle.ride_status === 'accepted'
    ? (lang === 'ht' ? 'Chofè a aksepte trajè a' : 'Votre chauffeur a accepté')
    : bundle.ride_status === 'driver_arriving'
      ? (lang === 'ht' ? 'Chofè a rive' : 'Votre chauffeur est arrivé')
      : (lang === 'ht' ? 'Trajè a ankou' : 'Trajet en cours')

  const name = bundle.driver_name?.trim() || (lang === 'ht' ? 'Chofè ou' : 'Votre chauffeur')
  const initial = name.charAt(0).toUpperCase()
  const rating = Number(bundle.average_rating ?? 0).toFixed(1)
  const vehicle = [bundle.vehicle_make, bundle.vehicle_model].filter(Boolean).join(' ') || (lang === 'ht' ? 'Veyikil' : 'Véhicule')
  const fare = bundle.estimated_fare_htg == null ? '—' : `${Number(bundle.estimated_fare_htg).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} HTG`
  const liveDistance = liveDistanceKm == null ? 'GPS…' : `${liveDistanceKm.toFixed(1)} km`
  const liveEta = liveEtaMin == null ? 'ETA…' : `${liveEtaMin} min`
  const liveLabel = bundle.ride_status === 'in_progress'
    ? (lang === 'ht' ? 'Rès wout pou destinasyon' : 'Distance restante')
    : (lang === 'ht' ? 'Chofè a ap rive nan' : 'Votre chauffeur arrive dans')

  return <aside className="active-ride-panel" aria-live="polite">
    <div className="account-line">{lang === 'ht' ? 'Kont kliyan' : 'Compte client'}: <strong>{email || '—'}</strong></div>
    <div className="status">{status}</div>

    <div className="driver-main">
      <div className="avatar">
        {bundle.avatar_url ? <img src={bundle.avatar_url} alt="" /> : <span>{initial}</span>}
      </div>
      <div className="driver-copy">
        <strong>{name}</strong>
        <span>⭐ {rating} / 5 · {bundle.total_rides ?? 0} {lang === 'ht' ? 'trajè' : 'trajet'}</span>
      </div>
      <div className="vehicle-icon">{bundle.vehicle_type === 'moto' ? '🏍️' : '🚕'}</div>
    </div>

    <div className="vehicle-line">
      <div><small>{lang === 'ht' ? 'Veyikil' : 'Véhicule'}</small><strong>{vehicle}</strong></div>
      <div className="plate"><small>{lang === 'ht' ? 'Plak' : 'Plaque'}</small><strong>{bundle.plate_number || '—'}</strong></div>
    </div>

    <div className="live-arrival">
      <small>{liveLabel}</small>
      <div><strong>{liveDistance}</strong><strong>⏱ {liveEta}</strong></div>
    </div>

    <div className="ride-box">
      <div><small>{lang === 'ht' ? 'Pran kliyan' : 'Prise en charge'}</small><strong>{bundle.pickup_address}</strong></div>
      <div><small>{lang === 'ht' ? 'Destinasyon' : 'Destination'}</small><strong>{bundle.destination_address}</strong></div>
      <div className="metrics"><span>{bundle.service_type || 'Standard'}</span><span>💵 {fare}</span></div>
    </div>

    <style jsx>{`
      .active-ride-panel{position:fixed;left:50%;bottom:84px;transform:translateX(-50%);z-index:12050;width:min(calc(100vw - 20px),720px);max-height:64vh;overflow:auto;background:#fff;border:2px solid #0f7b61;border-radius:22px;padding:14px 15px;box-shadow:0 18px 60px rgba(16,32,51,.32);font-family:Inter,system-ui,sans-serif;color:#102033}
      .account-line{font-size:11px;color:#6c7c8c;margin-bottom:7px;overflow-wrap:anywhere}.account-line strong{color:#102033}
      .status{font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#0f7b61;margin-bottom:10px}
      .driver-main{display:flex;align-items:center;gap:12px}.avatar{width:48px;height:48px;border-radius:50%;overflow:hidden;background:#e6f5ef;display:grid;place-items:center;color:#0f7b61;font-size:21px;font-weight:900;flex:0 0 auto}.avatar img{width:100%;height:100%;object-fit:cover}.driver-copy{min-width:0;flex:1}.driver-copy strong,.driver-copy span{display:block}.driver-copy strong{font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.driver-copy span{font-size:12px;color:#6e7e8e;margin-top:3px;font-weight:700}.vehicle-icon{font-size:28px}
      .vehicle-line{display:flex;justify-content:space-between;gap:20px;margin-top:10px;padding-top:10px;border-top:1px solid #edf1f3}.vehicle-line small,.vehicle-line strong{display:block}.vehicle-line small,.ride-box small,.live-arrival small{color:#8493a1;font-size:10px}.vehicle-line strong{font-size:13px;margin-top:2px}.plate{text-align:right}
      .live-arrival{margin-top:10px;padding:12px;border-radius:16px;background:#eaf8f3;border:1px solid #cdece1}.live-arrival small{display:block;color:#0f7b61;font-weight:900;letter-spacing:.04em;text-transform:uppercase}.live-arrival div{display:flex;gap:9px;flex-wrap:wrap;margin-top:7px}.live-arrival strong{font-size:18px;background:#0f7b61;color:#fff;border-radius:999px;padding:7px 11px}
      .ride-box{margin-top:10px;padding:11px 12px;border-radius:15px;background:#f5f8fa;display:grid;gap:8px}.ride-box strong{display:block;font-size:13px;margin-top:2px}.metrics{display:flex;gap:7px;flex-wrap:wrap;margin-top:2px}.metrics span{background:#102033;color:#fff;border-radius:999px;padding:6px 8px;font-size:11px;font-weight:800}
      @media(max-width:600px){.active-ride-panel{bottom:78px;max-height:60vh;padding:12px 13px}.driver-copy strong{font-size:15px}.live-arrival strong{font-size:16px}}
    `}</style>
  </aside>
}
