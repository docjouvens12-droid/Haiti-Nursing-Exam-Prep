'use client'

import { useEffect, useRef, useState } from 'react'
import type { Map as MapboxMap, Marker as MapboxMarker } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

type RideStatus = 'requested' | 'accepted' | 'driver_arriving' | 'in_progress' | 'completed' | 'cancelled'

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
type MapboxModule = typeof import('mapbox-gl')

export default function DriverNavigationMap({ ride, lang }: Props) {
  const onDashboard = typeof window !== 'undefined' && window.location.pathname === '/driver/dashboard'
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapboxRef = useRef<MapboxModule | null>(null)
  const mapRef = useRef<MapboxMap | null>(null)
  const driverMarkerRef = useRef<MapboxMarker | null>(null)
  const targetMarkerRef = useRef<MapboxMarker | null>(null)
  const watchRef = useRef<number | null>(null)
  const [opened, setOpened] = useState(true)
  const [position, setPosition] = useState<Point | null>(null)
  const [distanceKm, setDistanceKm] = useState<number | null>(null)
  const [etaMin, setEtaMin] = useState<number | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [mapFailed, setMapFailed] = useState(false)

  const goingToDestination = ride.status === 'in_progress'
  const targetLat = goingToDestination ? ride.destination_latitude : ride.pickup_latitude
  const targetLng = goingToDestination ? ride.destination_longitude : ride.pickup_longitude
  const targetAddress = goingToDestination ? ride.destination_address : ride.pickup_address

  useEffect(() => {
    if (onDashboard && ['accepted', 'driver_arriving', 'in_progress'].includes(ride.status)) {
      window.location.replace('/driver/navigation')
    }
  }, [onDashboard, ride.status])

  useEffect(() => {
    if (onDashboard) return
    setOpened(true)
    setMapFailed(false)
  }, [ride.status, onDashboard])

  useEffect(() => {
    if (onDashboard || !opened) return
    let cancelled = false
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token || !containerRef.current || mapRef.current) return

    ;(async () => {
      try {
        const mod = await import('mapbox-gl')
        if (cancelled || !containerRef.current) return
        mapboxRef.current = mod
        mod.default.accessToken = token
        const map = new mod.default.Map({
          container: containerRef.current,
          style: 'mapbox://styles/mapbox/navigation-day-v1',
          center: [-72.3364, 18.5392],
          zoom: 14,
          pitch: 45,
          attributionControl: true,
        })
        map.addControl(new mod.default.NavigationControl({ showCompass: true }), 'bottom-right')
        mapRef.current = map
        map.once('load', () => {
          if (!cancelled) setMapReady(true)
        })
      } catch {
        if (!cancelled) setMapFailed(true)
      }
    })()

    return () => {
      cancelled = true
      driverMarkerRef.current?.remove()
      targetMarkerRef.current?.remove()
      mapRef.current?.remove()
      mapRef.current = null
      mapboxRef.current = null
      setMapReady(false)
    }
  }, [opened, onDashboard])

  useEffect(() => {
    if (onDashboard || !opened || !navigator.geolocation) return
    watchRef.current = navigator.geolocation.watchPosition(
      (p) => setPosition({ lat: p.coords.latitude, lng: p.coords.longitude, heading: p.coords.heading ?? null }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    )
    return () => {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current)
      watchRef.current = null
    }
  }, [opened, onDashboard])

  useEffect(() => {
    if (onDashboard) return
    const map = mapRef.current
    const mb = mapboxRef.current?.default
    if (!map || !mb || !position) return
    if (!driverMarkerRef.current) {
      const el = document.createElement('div')
      el.className = 'driver-nav-car'
      el.innerHTML = '<span>🚕</span>'
      driverMarkerRef.current = new mb.Marker({ element: el, rotationAlignment: 'map' }).addTo(map)
    }
    driverMarkerRef.current.setLngLat([position.lng, position.lat])
    if (position.heading != null) driverMarkerRef.current.setRotation(position.heading)
    map.easeTo({ center: [position.lng, position.lat], zoom: 15.5, bearing: position.heading ?? map.getBearing(), pitch: 50, duration: 700 })
  }, [position, mapReady, onDashboard])

  useEffect(() => {
    if (onDashboard) return
    const map = mapRef.current
    const mb = mapboxRef.current?.default
    if (!map || !mb || targetLat == null || targetLng == null) return
    targetMarkerRef.current?.remove()
    const el = document.createElement('div')
    el.className = 'driver-nav-target'
    el.textContent = goingToDestination ? '🏁' : '📍'
    targetMarkerRef.current = new mb.Marker({ element: el }).setLngLat([targetLng, targetLat]).addTo(map)
  }, [targetLat, targetLng, goingToDestination, mapReady, onDashboard])

  useEffect(() => {
    if (onDashboard) return
    const map = mapRef.current
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!map || !token || !position || targetLat == null || targetLng == null || !mapReady) return
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
      } catch {
        if (!cancelled) { setDistanceKm(null); setEtaMin(null) }
      }
    })()
    return () => { cancelled = true }
  }, [position?.lat, position?.lng, targetLat, targetLng, mapReady, onDashboard])

  if (onDashboard) {
    return <div style={{padding:'14px',borderRadius:16,background:'#eef4ff',color:'#174a8b',fontWeight:800,margin:'12px 0'}}>{lang === 'fr' ? 'Ouverture automatique du GPS…' : 'GPS ap louvri otomatikman…'}</div>
  }

  if (!opened) {
    return <div className="driver-nav-launch">
      <div><small>{goingToDestination ? (lang === 'fr' ? 'DESTINATION' : 'DESTINASYON') : (lang === 'fr' ? 'ALLER VERS LE PASSAGER' : 'ALE KOTE PASAJE A')}</small><strong>{targetAddress}</strong></div>
      <button type="button" onClick={() => { setMapFailed(false); setOpened(true) }}>{lang === 'fr' ? '🧭 Réouvrir le GPS' : '🧭 Relouvri GPS'}</button>
      <style jsx>{`
        .driver-nav-launch{display:flex;justify-content:space-between;gap:12px;align-items:center;border-radius:18px;border:1px solid #dfe6ed;background:#f7fafc;padding:14px;margin:12px 0 14px}.driver-nav-launch div{min-width:0}.driver-nav-launch small,.driver-nav-launch strong{display:block}.driver-nav-launch small{font-size:10px;color:#728397;font-weight:900;letter-spacing:.05em}.driver-nav-launch strong{margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.driver-nav-launch button{border:0;border-radius:14px;background:#1479ff;color:#fff;font-weight:900;padding:12px 14px;white-space:nowrap}@media(max-width:600px){.driver-nav-launch{align-items:stretch;flex-direction:column}.driver-nav-launch button{width:100%}}
      `}</style>
    </div>
  }

  return <div className="driver-nav-shell">
    <div className="driver-nav-head">
      <div><small>{goingToDestination ? (lang === 'fr' ? 'NAVIGATION VERS LA DESTINATION' : 'NAVIGASYON POU DESTINASYON') : (lang === 'fr' ? 'NAVIGATION VERS LE PASSAGER' : 'NAVIGASYON POU PASAJE A')}</small><strong>{targetAddress}</strong></div>
      <b>{distanceKm == null ? (mapFailed ? (lang === 'fr' ? 'Carte indisponible' : 'Kat pa disponib') : 'GPS') : `${distanceKm.toFixed(1)} km${etaMin == null ? '' : ` · ${etaMin} min`}`}</b>
    </div>
    <div ref={containerRef} className="driver-nav-map" />
    {!mapReady && !mapFailed && <div className="driver-nav-loading">{lang === 'fr' ? 'Chargement automatique du GPS…' : 'GPS ap louvri otomatikman…'}</div>}
    {mapFailed && <div className="driver-nav-loading"><span>{lang === 'fr' ? 'La carte n’a pas pu charger.' : 'Kat la pa t ka chaje.'}</span><button type="button" onClick={() => setOpened(false)}>{lang === 'fr' ? 'Réessayer' : 'Eseye ankò'}</button></div>}
    <style jsx global>{`
      .driver-nav-shell{overflow:hidden;border-radius:20px;border:1px solid #dfe6ed;background:#fff;margin:12px 0 14px;box-shadow:0 10px 28px rgba(16,32,51,.09)}
      .driver-nav-head{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:12px 14px;background:#102033;color:#fff}
      .driver-nav-head div{min-width:0}.driver-nav-head small,.driver-nav-head strong{display:block}.driver-nav-head small{font-size:10px;color:#a9bdd0;font-weight:850;letter-spacing:.04em}.driver-nav-head strong{font-size:14px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.driver-nav-head b{white-space:nowrap;font-size:13px;background:#1c3148;border-radius:999px;padding:8px 10px}
      .driver-nav-map{height:340px;width:100%}.driver-nav-loading{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:12px 14px;color:#66778a;font-size:13px;background:#f6f8fa}.driver-nav-loading button{border:0;border-radius:10px;padding:8px 10px;background:#102033;color:#fff;font-weight:800}.driver-nav-car{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:#fff;border:3px solid #1479ff;box-shadow:0 8px 20px rgba(16,32,51,.3);font-size:22px}.driver-nav-target{font-size:29px;filter:drop-shadow(0 4px 6px rgba(0,0,0,.25))}
      @media(max-width:600px){.driver-nav-map{height:300px}.driver-nav-head{align-items:flex-start;flex-direction:column}.driver-nav-head b{align-self:flex-start}.driver-nav-loading{align-items:flex-start;flex-direction:column}}
    `}</style>
  </div>
}
