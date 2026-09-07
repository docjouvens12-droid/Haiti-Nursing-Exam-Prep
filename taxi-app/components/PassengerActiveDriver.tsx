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

    async function loadFallback(): Promise<ActiveRideBundle | null> {
      const [driverResp, trackingResp] = await Promise.all([
        supabase.rpc('get_passenger_active_driver'),
        supabase.rpc('get_passenger_live_driver_tracking'),
      ])
      const driver = Array.isArray(driverResp.data) ? driverResp.data[0] : driverResp.data
      const tracking = Array.isArray(trackingResp.data) ? trackingResp.data[0] : trackingResp.data
      if (!driver || !tracking || driver.ride_id !== tracking.ride_id) return null
      return {
        ride_id: tracking.ride_id,
        ride_status: tracking.ride_status,
        pickup_latitude: tracking.pickup_latitude,
        pickup_longitude: tracking.pickup_longitude,
        destination_latitude: tracking.destination_latitude,
        destination_longitude: tracking.destination_longitude,
        driver_name: driver.driver_name,
        avatar_url: driver.avatar_url,
        vehicle_color: driver.vehicle_color,
        driver_latitude: tracking.driver_latitude,
        driver_longitude: tracking.driver_longitude,
      } as ActiveRideBundle
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

      let next = (!error ? (Array.isArray(data) ? data[0] : data) : null) as ActiveRideBundle | null
      if (!next) next = await loadFallback()
      if (!active) return

      setBundle(next)
      await updateLiveMetrics(next)
    }

    void load()
    const timer = window.setInterval(() => void load(), 2000)
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
      <div className="arrivalCopy">
        <strong>{lang === 'ht' ? 'Chofè ou rive' : 'Votre chauffeur est arrivé'}</strong>
        <span>{lang === 'ht' ? 'Chofè a ap tann ou nan pwen pickup la.' : 'Votre chauffeur vous attend au point de prise en charge.'}</span>
      </div>
      <style jsx>{`
        .arrivalMessage{position:fixed;left:50%;bottom:max(82px,calc(env(safe-area-inset-bottom) + 66px));transform:translateX(-50%);z-index:12050;width:min(calc(100vw - 24px),520px);display:flex;align-items:center;gap:11px;background:#fff;border:1px solid #cfe8df;border-radius:18px;padding:12px 13px;box-shadow:0 14px 34px rgba(16,32,51,.2);font-family:Inter,system-ui,sans-serif;color:#102033;box-sizing:border-box}
        .arrivalIcon{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:#e7f6f0;color:#0f7b61;font-size:21px;font-weight:900;flex:0 0 auto}.arrivalCopy{min-width:0;flex:1}.arrivalMessage strong,.arrivalMessage span{display:block}.arrivalMessage strong{font-size:15px;color:#0f7b61;line-height:1.2}.arrivalMessage span{font-size:11px;line-height:1.35;color:#6f7f8f;margin-top:3px}
        @media(max-width:600px){.arrivalMessage{width:calc(100vw - 20px);padding:11px 12px;border-radius:17px}.arrivalIcon{width:38px;height:38px;font-size:20px}.arrivalMessage strong{font-size:14px}}
      `}</style>
    </aside>
  }

  const name = bundle.driver_name?.trim() || (lang === 'ht' ? 'Chofè ou' : 'Votre chauffeur')
  const initial = name.charAt(0).toUpperCase()
  const color = bundle.vehicle_color?.trim() || '—'
  const distance = liveDistanceKm == null ? 'GPS…' : `${liveDistanceKm.toFixed(1)} km`
  const eta = liveEtaMin == null ? 'ETA…' : `${liveEtaMin} min`
  const statusLabel = bundle.ride_status === 'accepted'
    ? (lang === 'ht' ? 'Chofè a ap vini' : 'Chauffeur en route')
    : (lang === 'ht' ? 'Trajè ap fèt' : 'Trajet en cours')

  return <aside className="activeRideCard" aria-live="polite">
    <div className="statusRow"><span>{statusLabel}</span><div><b>{distance}</b><b>⏱ {eta}</b></div></div>
    <div className="identityRow">
      <div className="avatar">{bundle.avatar_url ? <img src={bundle.avatar_url} alt="" /> : <span>{initial}</span>}</div>
      <div className="identityCopy">
        <strong>{name}</strong>
        <span>{lang === 'ht' ? 'Koulè veyikil' : 'Couleur du véhicule'}: <b>{color}</b></span>
      </div>
    </div>

    {miniMapUrl && <div className="miniMap">
      <img src={miniMapUrl} alt={lang === 'ht' ? 'Trajektwa chofè a an dirèk' : 'Trajet en direct du chauffeur'} />
    </div>}

    <style jsx>{`
      .activeRideCard{position:fixed;left:50%;bottom:max(82px,calc(env(safe-area-inset-bottom) + 66px));transform:translateX(-50%);z-index:12050;width:min(calc(100vw - 24px),520px);background:#fff;border:1px solid #dce8e3;border-radius:20px;padding:10px;box-shadow:0 14px 36px rgba(16,32,51,.22);font-family:Inter,system-ui,sans-serif;color:#102033;box-sizing:border-box;overflow:hidden}
      .statusRow{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:1px 2px 9px}.statusRow>span{font-size:10px;font-weight:900;letter-spacing:.055em;text-transform:uppercase;color:#0f7b61}.statusRow>div{display:flex;gap:5px;min-width:0}.statusRow b{display:inline-flex;align-items:center;white-space:nowrap;border-radius:999px;background:#eef4f2;color:#102033;padding:5px 8px;font-size:10px}
      .identityRow{display:flex;align-items:center;gap:10px;padding:0 2px 9px}.avatar{width:44px;height:44px;border-radius:50%;overflow:hidden;background:#e7f6f0;color:#0f7b61;display:grid;place-items:center;font-size:18px;font-weight:900;flex:0 0 auto}.avatar img{width:100%;height:100%;object-fit:cover}
      .identityCopy{min-width:0;flex:1}.identityCopy strong,.identityCopy span{display:block}.identityCopy strong{font-size:15px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.identityCopy span{font-size:11px;color:#6f7f8f;margin-top:3px}.identityCopy b{color:#102033}
      .miniMap{position:relative;border-radius:15px;overflow:hidden;background:#e8eef1;min-height:138px;border:1px solid #e3e9ec}.miniMap img{display:block;width:100%;height:160px;object-fit:cover}
      @media(max-width:600px){.activeRideCard{width:calc(100vw - 20px);padding:9px;border-radius:18px}.statusRow{padding-bottom:8px}.statusRow>span{font-size:9px}.statusRow b{padding:5px 7px;font-size:9px}.avatar{width:42px;height:42px}.identityCopy strong{font-size:14px}.miniMap img{height:145px}}
    `}</style>
  </aside>
}
