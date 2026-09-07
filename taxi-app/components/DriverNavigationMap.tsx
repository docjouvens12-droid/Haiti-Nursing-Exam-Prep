'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl, { Map } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

type RideStatus = 'accepted' | 'driver_arriving' | 'in_progress'

type Ride = {
  status: RideStatus
  pickup_latitude: number | null
  pickup_longitude: number | null
  destination_latitude: number | null
  destination_longitude: number | null
  pickup_address: string
  destination_address: string
}

type Props = { ride: Ride; lang: 'fr' | 'ht' }

type Point = { lat: number; lng: number; heading: number | null }

export default function DriverNavigationMap({ ride, lang }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)
  const driverMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const targetMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const watchRef = useRef<number | null>(null)
  const [position, setPosition] = useState<Point | null>(null)
  const [distanceKm, setDistanceKm] = useState<number | null>(null)
  const [etaMin, setEtaMin] = useState<number | null>(null)

  const goingToDestination = ride.status === 'in_progress'
  const targetLat = goingToDestination ? ride.destination_latitude : ride.pickup_latitude
  const targetLng = goingToDestination ? ride.destination_longitude : ride.pickup_longitude
  const targetAddress = goingToDestination ? ride.destination_address : ride.pickup_address

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token || !containerRef.current || mapRef.current) return
    mapboxgl.accessToken = token
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/navigation-day-v1',
      center: [-72.3364, 18.5392],
      zoom: 14,
      pitch: 45,
      attributionControl: true,
    })
    mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'bottom-right')
    return () => {
      driverMarkerRef.current?.remove()
      targetMarkerRef.current?.remove()
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) return
    watchRef.current = navigator.geolocation.watchPosition(
      (p) => setPosition({ lat: p.coords.latitude, lng: p.coords.longitude, heading: p.coords.heading ?? null }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    )
    return () => {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current)
      watchRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !position) return
    if (!driverMarkerRef.current) {
      const el = document.createElement('div')
      el.className = 'driver-nav-car'
      el.innerHTML = '<span>🚕</span>'
      driverMarkerRef.current = new mapboxgl.Marker({ element: el, rotationAlignment: 'map' }).addTo(map)
    }
    driverMarkerRef.current.setLngLat([position.lng, position.lat])
    if (position.heading != null) driverMarkerRef.current.setRotation(position.heading)
    map.easeTo({ center: [position.lng, position.lat], zoom: 15.5, bearing: position.heading ?? map.getBearing(), pitch: 50, duration: 700 })
  }, [position])

  useEffect(() => {
    const map = mapRef.current
    if (!map || targetLat == null || targetLng == null) return
    targetMarkerRef.current?.remove()
    const el = document.createElement('div')
    el.className = 'driver-nav-target'
    el.textContent = goingToDestination ? '🏁' : '📍'
    targetMarkerRef.current = new mapboxgl.Marker({ element: el }).setLngLat([targetLng, targetLat]).addTo(map)
  }, [targetLat, targetLng, goingToDestination])

  useEffect(() => {
    const map = mapRef.current
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!map || !token || !position || targetLat == null || targetLng == null) return
    let cancelled = false
    ;(async () => {
      try {
        const coords = `${position.lng},${position.lat};${targetLng},${targetLat}`
        const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?overview=full&geometries=geojson&steps=true&access_token=${encodeURIComponent(token)}`)
        const json = await response.json()
        const route = json.routes?.[0]
        if (!route || cancelled) return
        setDistanceKm(route.distance / 1000)
        setEtaMin(Math.max(1, Math.round(route.duration / 60)))

        const render = () => {
          if (!map.getStyle()) return
          if (map.getLayer('driver-nav-route')) map.removeLayer('driver-nav-route')
          if (map.getSource('driver-nav-route')) map.removeSource('driver-nav-route')
          map.addSource('driver-nav-route', {
            type: 'geojson',
            data: { type: 'Feature', properties: {}, geometry: route.geometry },
          })
          map.addLayer({
            id: 'driver-nav-route',
            type: 'line',
            source: 'driver-nav-route',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#1479ff', 'line-width': 7, 'line-opacity': 0.95 },
          })
        }
        if (map.isStyleLoaded()) render()
        else map.once('load', render)
      } catch {
        if (!cancelled) { setDistanceKm(null); setEtaMin(null) }
      }
    })()
    return () => { cancelled = true }
  }, [position?.lat, position?.lng, targetLat, targetLng])

  return <div className="driver-nav-shell">
    <div className="driver-nav-head">
      <div><small>{goingToDestination ? (lang === 'fr' ? 'NAVIGATION VERS LA DESTINATION' : 'NAVIGASYON POU DESTINASYON') : (lang === 'fr' ? 'NAVIGATION VERS LE PASSAGER' : 'NAVIGASYON POU PASAJE A')}</small><strong>{targetAddress}</strong></div>
      <b>{distanceKm == null ? 'GPS' : `${distanceKm.toFixed(1)} km${etaMin == null ? '' : ` · ${etaMin} min`}`}</b>
    </div>
    <div ref={containerRef} className="driver-nav-map" />
    <style jsx global>{`
      .driver-nav-shell{overflow:hidden;border-radius:20px;border:1px solid #dfe6ed;background:#fff;margin:12px 0 14px;box-shadow:0 10px 28px rgba(16,32,51,.09)}
      .driver-nav-head{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:12px 14px;background:#102033;color:#fff}
      .driver-nav-head div{min-width:0}.driver-nav-head small,.driver-nav-head strong{display:block}.driver-nav-head small{font-size:10px;color:#a9bdd0;font-weight:850;letter-spacing:.04em}.driver-nav-head strong{font-size:14px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.driver-nav-head b{white-space:nowrap;font-size:13px;background:#1c3148;border-radius:999px;padding:8px 10px}
      .driver-nav-map{height:340px;width:100%}.driver-nav-car{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:#fff;border:3px solid #1479ff;box-shadow:0 8px 20px rgba(16,32,51,.3);font-size:22px}.driver-nav-target{font-size:29px;filter:drop-shadow(0 4px 6px rgba(0,0,0,.25))}
      @media(max-width:600px){.driver-nav-map{height:300px}.driver-nav-head{align-items:flex-start;flex-direction:column}.driver-nav-head b{align-self:flex-start}}
    `}</style>
  </div>
}
