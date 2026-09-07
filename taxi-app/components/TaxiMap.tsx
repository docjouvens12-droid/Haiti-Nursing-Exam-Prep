'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

type Point = { lat: number; lng: number }
type RouteGeometry = { type: 'LineString'; coordinates: number[][] }

type Props = {
  pickup: Point | null
  destination: Point | null
  routeGeometry: RouteGeometry | null
}

type LiveTracking = {
  ride_id: string
  ride_status: 'accepted' | 'driver_arriving' | 'in_progress'
  driver_id: string
  driver_latitude: number | null
  driver_longitude: number | null
  driver_heading: number | null
  driver_speed_kph: number | null
  location_updated_at: string | null
  pickup_latitude: number | null
  pickup_longitude: number | null
  destination_latitude: number | null
  destination_longitude: number | null
}

export default function TaxiMap({ pickup, destination }: Props) {
  const requestRef = useRef(0)
  const [tracking, setTracking] = useState<LiveTracking | null>(null)
  const [driverDistanceKm, setDriverDistanceKm] = useState<number | null>(null)
  const [driverEtaMin, setDriverEtaMin] = useState<number | null>(null)
  const [driverRoutePolyline, setDriverRoutePolyline] = useState<string | null>(null)
  const [mapFailed, setMapFailed] = useState(false)

  useEffect(() => {
    let active = true

    async function loadTracking() {
      const { data, error } = await supabase.rpc('get_passenger_live_driver_tracking')
      if (!active) return
      if (error) {
        setTracking(null)
        return
      }
      const row = (Array.isArray(data) ? data[0] : data) as LiveTracking | undefined
      setTracking(row ?? null)
    }

    void loadTracking()
    const timer = window.setInterval(() => void loadTracking(), 2500)
    const { data: authListener } = supabase.auth.onAuthStateChange(() => void loadTracking())

    return () => {
      active = false
      window.clearInterval(timer)
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const lat = tracking?.driver_latitude
    const lng = tracking?.driver_longitude
    const targetLat = tracking?.ride_status === 'in_progress' ? tracking.destination_latitude : tracking?.pickup_latitude
    const targetLng = tracking?.ride_status === 'in_progress' ? tracking.destination_longitude : tracking?.pickup_longitude
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

    if (lat == null || lng == null || targetLat == null || targetLng == null || !token) {
      setDriverDistanceKm(null)
      setDriverEtaMin(null)
      setDriverRoutePolyline(null)
      return
    }

    const requestId = ++requestRef.current
    const controller = new AbortController()

    ;(async () => {
      try {
        const coords = `${lng},${lat};${targetLng},${targetLat}`
        const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?overview=full&geometries=polyline&steps=false&access_token=${encodeURIComponent(token)}`, { signal: controller.signal })
        const json = await response.json()
        const route = json.routes?.[0]
        if (!route || requestId !== requestRef.current) return
        setDriverDistanceKm(route.distance / 1000)
        setDriverEtaMin(Math.max(1, Math.round(route.duration / 60)))
        setDriverRoutePolyline(route.geometry ?? null)
      } catch {
        if (!controller.signal.aborted && requestId === requestRef.current) {
          setDriverDistanceKm(null)
          setDriverEtaMin(null)
          setDriverRoutePolyline(null)
        }
      }
    })()

    return () => controller.abort()
  }, [tracking])

  const mapUrl = useMemo(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token) return ''

    const driverLat = tracking?.driver_latitude
    const driverLng = tracking?.driver_longitude
    const targetLat = tracking?.ride_status === 'in_progress' ? tracking.destination_latitude : tracking?.pickup_latitude
    const targetLng = tracking?.ride_status === 'in_progress' ? tracking.destination_longitude : tracking?.pickup_longitude

    if (driverLat != null && driverLng != null && targetLat != null && targetLng != null) {
      const overlays = [
        driverRoutePolyline ? `path-5+1479ff-0.9(${encodeURIComponent(driverRoutePolyline)})` : null,
        `pin-s-a+1479ff(${driverLng},${driverLat})`,
        `pin-s-b+0d7b61(${targetLng},${targetLat})`,
      ].filter(Boolean).join(',')
      return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${overlays}/auto/800x600?padding=55&access_token=${encodeURIComponent(token)}`
    }

    if (pickup && destination) {
      const overlays = [
        `pin-s-a+1479ff(${pickup.lng},${pickup.lat})`,
        `pin-s-b+0d7b61(${destination.lng},${destination.lat})`,
      ].join(',')
      return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${overlays}/auto/800x600?padding=55&access_token=${encodeURIComponent(token)}`
    }

    const center = pickup ?? { lat: 18.5392, lng: -72.3364 }
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${center.lng},${center.lat},12/800x600?access_token=${encodeURIComponent(token)}`
  }, [pickup, destination, tracking, driverRoutePolyline])

  useEffect(() => setMapFailed(false), [mapUrl])

  const trackingLabel = tracking?.ride_status === 'in_progress' ? 'Vers la destination' : 'Chauffeur en route'

  return (
    <div className="safe-map-wrap">
      {mapUrl && !mapFailed ? (
        <img className="safe-map" src={mapUrl} alt="Carte du trajet" onError={() => setMapFailed(true)} />
      ) : (
        <div className="safe-map-placeholder">Carte temporairement indisponible</div>
      )}
      {tracking && tracking.driver_latitude != null && tracking.driver_longitude != null && (
        <div className="live-tracking-badge">
          <strong>🚕 {trackingLabel}</strong>
          <span>{driverDistanceKm == null ? 'Position en direct' : `${driverDistanceKm.toFixed(1)} km`}{driverEtaMin == null ? '' : ` · ${driverEtaMin} min`}</span>
        </div>
      )}
      <style jsx>{`
        .safe-map-wrap{position:relative;width:100%;height:100%;min-height:300px;background:#eaf0f4;overflow:hidden}
        .safe-map{display:block;width:100%;height:100%;min-height:300px;object-fit:cover}
        .safe-map-placeholder{min-height:300px;display:grid;place-items:center;color:#66778a;font-weight:750;padding:20px;text-align:center}
        .live-tracking-badge{position:absolute;left:14px;top:14px;z-index:8;background:rgba(16,32,51,.92);color:#fff;border-radius:14px;padding:9px 12px;box-shadow:0 8px 22px rgba(16,32,51,.2);font-family:Inter,system-ui,sans-serif;pointer-events:none}
        .live-tracking-badge strong,.live-tracking-badge span{display:block}.live-tracking-badge strong{font-size:13px}.live-tracking-badge span{font-size:12px;margin-top:2px;color:#dce7ef}
      `}</style>
    </div>
  )
}
