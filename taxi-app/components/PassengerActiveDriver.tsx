'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../lib/supabase'

type ActiveRideBundle = {
  ride_id: string
  ride_status: 'accepted' | 'driver_arriving' | 'in_progress'
  pickup_latitude: number | null
  pickup_longitude: number | null
  destination_latitude: number | null
  destination_longitude: number | null
  driver_name: string | null
  avatar_url: string | null
  vehicle_color: string | null
  driver_latitude: number | null
  driver_longitude: number | null
}

export default function PassengerActiveDriver() {
  const pathname = usePathname()
  const [bundle, setBundle] = useState<ActiveRideBundle | null>(null)
  const [lang, setLang] = useState<'fr' | 'ht'>('fr')
  const [liveDistanceKm, setLiveDistanceKm] = useState<number | null>(null)
  const [liveEtaMin, setLiveEtaMin] = useState<number | null>(null)
  const [routeGeometry, setRouteGeometry] = useState<string | null>(null)

  useEffect(() => {
    if (pathname !== '/') return
    const saved = window.localStorage.getItem('taxi-language')
    if (saved === 'ht' || saved === 'fr') setLang(saved)

    let active = true

    async function updateLiveMetrics(row: ActiveRideBundle | null) {
      if (!row || row.ride_status === 'driver_arriving' || row.driver_latitude == null || row.driver_longitude == null) {
        if (active) {
          setLiveDistanceKm(null)
          setLiveEtaMin(null)
          setRouteGeometry(null)
        }
        return
      }

      const goingToPassenger = row.ride_status === 'accepted'
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
    if (!bundle || bundle.ride_status === 'driver_arriving' || !routeGeometry) return null
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token || bundle.driver_latitude == null || bundle.driver_longitude == null) return null
    const goingToPassenger = bundle.ride_status === 'accepted'
    const targetLat = goingToPassenger ? bundle.pickup_latitude : bundle.destination_latitude
    const targetLng = goingToPassenger ? bundle.pickup_longitude : bundle.destination_longitude
    if (targetLat == null || targetLng == null) return null

    const path = `path-5+0f7b61-0.95(${encodeURIComponent(routeGeometry)})`
    const driverPin = `pin-s-car+0f7b61(${bundle.driver_longitude},${bundle.driver_latitude})`
    const targetPin = `pin-s-marker+102033(${targetLng},${targetLat})`
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${path},${driverPin},${targetPin}/auto/600x260@2x?padding=34&access_token=${encodeURIComponent(token)}`
  }, [bundle, routeGeometry])

  if (pathname !== '/' || !bundle) return null

  if (bundle.ride_status === 'driver_arriving') {
    return <aside className="arrivalMessage" aria-live="polite">
      <div className="arrivalIcon">✓</div>
      <div>
        <strong>{lang === 'ht' ? 'Chofè ou rive' : 'Votre chauffeur est arrivé'}</strong>
        <span>{lang === 'ht' ? 'Chofè a ap tann ou nan pwen pickup la.' : 'Votre chauffeur vous attend au point de prise en charge.'}</span>
      </div>
      <style jsx>{`
        .arrivalMessage{position:fixed;left:50%;bottom:88px;transform:translateX(-50%);z-index:12050;width:min(calc(100vw - 18px),560px);display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #cfe8df;border-radius:18px;padding:13px 14px;box-shadow:0 14px 38px rgba(16,32,51,.22);font-family:Inter,system-ui,sans-serif;color:#102033}
        .arrivalIcon{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:#e7f6f0;color:#0f7b61;font-size:22px;font-weight:900;flex:0 0 auto}.arrivalMessage strong,.arrivalMessage span{display:block}.arrivalMessage strong{font-size:16px;color:#0f7b61}.arrivalMessage span{font-size:11px;color:#6f7f8f;margin-top:3px}
        @media(max-width:600px){.arrivalMessage{bottom:80px}}
      `}</style>
    </aside>
  }

  const name = bundle.driver_name?.trim() || (lang === 'ht' ? 'Chofè ou' : 'Votre chauffeur')
  const initial = name.charAt(0).toUpperCase()
  const color = bundle.vehicle_color?.trim() || '—'
  const distance = liveDistanceKm == null ? 'GPS…' : `${liveDistanceKm.toFixed(1)} km`
  const eta = liveEtaMin == null ? 'ETA…' : `${liveEtaMin} min`

  return <aside className="activeRideCard" aria-live="polite">
    <div className="identityRow">
      <div className="avatar">{bundle.avatar_url ? <img src={bundle.avatar_url} alt="" /> : <span>{initial}</span>}</div>
      <div className="identityCopy">
        <strong>{name}</strong>
        <span>{lang === 'ht' ? 'Koulè veyikil' : 'Couleur du véhicule'}: <b>{color}</b></span>
      </div>
    </div>

    {miniMapUrl && <div className="miniMap">
      <img src={miniMapUrl} alt={lang === 'ht' ? 'Trajektwa chofè a an dirèk' : 'Trajet en direct du chauffeur'} />
      <div className="mapBadge"><strong>{distance}</strong><span>⏱ {eta}</span></div>
    </div>}

    <style jsx>{`
      .activeRideCard{position:fixed;left:50%;bottom:88px;transform:translateX(-50%);z-index:12050;width:min(calc(100vw - 18px),560px);background:#fff;border:1px solid #dce8e3;border-radius:20px;padding:11px;box-shadow:0 14px 38px rgba(16,32,51,.24);font-family:Inter,system-ui,sans-serif;color:#102033}
      .identityRow{display:flex;align-items:center;gap:11px}.avatar{width:46px;height:46px;border-radius:50%;overflow:hidden;background:#e7f6f0;color:#0f7b61;display:grid;place-items:center;font-size:19px;font-weight:900;flex:0 0 auto}.avatar img{width:100%;height:100%;object-fit:cover}
      .identityCopy{min-width:0;flex:1}.identityCopy strong,.identityCopy span{display:block}.identityCopy strong{font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.identityCopy span{font-size:11px;color:#6f7f8f;margin-top:3px}.identityCopy b{color:#102033}
      .miniMap{position:relative;border-radius:16px;overflow:hidden;background:#e8eef1;min-height:145px;margin-top:10px}.miniMap img{display:block;width:100%;height:170px;object-fit:cover}.mapBadge{position:absolute;left:10px;bottom:10px;display:flex;gap:8px;align-items:center;background:#102033;color:#fff;padding:7px 10px;border-radius:999px;font-size:11px;font-weight:900;box-shadow:0 4px 14px rgba(0,0,0,.18)}
      @media(max-width:600px){.activeRideCard{bottom:80px}.miniMap img{height:155px}}
    `}</style>
  </aside>
}
