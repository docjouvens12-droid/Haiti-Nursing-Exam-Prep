'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl, { LngLatBoundsLike, Map } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
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

export default function TaxiMap({ pickup, destination, routeGeometry }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)
  const pickupMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const driverMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const trackingRequestRef = useRef(0)
  const [tracking, setTracking] = useState<LiveTracking | null>(null)
  const [driverDistanceKm, setDriverDistanceKm] = useState<number | null>(null)
  const [driverEtaMin, setDriverEtaMin] = useState<number | null>(null)

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token || !containerRef.current || mapRef.current) return

    mapboxgl.accessToken = token
    const center: [number, number] = pickup ? [pickup.lng, pickup.lat] : [-72.3364, 18.5392]

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom: 12.5,
      attributionControl: true,
    })

    mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')

    return () => {
      pickupMarkerRef.current?.remove()
      destinationMarkerRef.current?.remove()
      driverMarkerRef.current?.remove()
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !pickup) return
    pickupMarkerRef.current?.remove()
    const el = document.createElement('div')
    el.className = 'mapbox-pickup-marker'
    pickupMarkerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat([pickup.lng, pickup.lat])
      .addTo(map)
  }, [pickup])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    destinationMarkerRef.current?.remove()
    if (!destination) return
    const el = document.createElement('div')
    el.className = 'mapbox-destination-marker'
    destinationMarkerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat([destination.lng, destination.lat])
      .addTo(map)
  }, [destination])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const render = () => {
      if (map.getLayer('taxi-route')) map.removeLayer('taxi-route')
      if (map.getSource('taxi-route')) map.removeSource('taxi-route')

      if (!routeGeometry) return

      map.addSource('taxi-route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: routeGeometry,
        },
      })
      map.addLayer({
        id: 'taxi-route',
        type: 'line',
        source: 'taxi-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#0f7a62', 'line-width': 5, 'line-opacity': 0.9 },
      })

      if (pickup && destination) {
        const bounds = new mapboxgl.LngLatBounds()
          .extend([pickup.lng, pickup.lat])
          .extend([destination.lng, destination.lat])
        for (const coord of routeGeometry.coordinates) bounds.extend(coord as [number, number])
        map.fitBounds(bounds as LngLatBoundsLike, { padding: 58, duration: 650, maxZoom: 15 })
      }
    }

    if (map.isStyleLoaded()) render()
    else map.once('load', render)
  }, [routeGeometry, pickup, destination])

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
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const lat = tracking?.driver_latitude
    const lng = tracking?.driver_longitude
    if (lat == null || lng == null) {
      driverMarkerRef.current?.remove()
      driverMarkerRef.current = null
      setDriverDistanceKm(null)
      setDriverEtaMin(null)
      return
    }

    if (!driverMarkerRef.current) {
      const el = document.createElement('div')
      el.className = 'mapbox-driver-marker'
      el.innerHTML = '<span>🚕</span>'
      driverMarkerRef.current = new mapboxgl.Marker({ element: el, rotationAlignment: 'map' }).addTo(map)
    }
    driverMarkerRef.current.setLngLat([lng, lat])
    if (tracking?.driver_heading != null) driverMarkerRef.current.setRotation(tracking.driver_heading)

    const targetLat = tracking?.ride_status === 'in_progress' ? tracking.destination_latitude : tracking?.pickup_latitude
    const targetLng = tracking?.ride_status === 'in_progress' ? tracking.destination_longitude : tracking?.pickup_longitude
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (targetLat == null || targetLng == null || !token) return

    const requestId = ++trackingRequestRef.current
    ;(async () => {
      try {
        const coords = `${lng},${lat};${targetLng},${targetLat}`
        const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?overview=false&steps=false&access_token=${encodeURIComponent(token)}`)
        const json = await response.json()
        const route = json.routes?.[0]
        if (!route || requestId !== trackingRequestRef.current) return
        setDriverDistanceKm(route.distance / 1000)
        setDriverEtaMin(Math.max(1, Math.round(route.duration / 60)))
      } catch {
        if (requestId !== trackingRequestRef.current) return
        setDriverDistanceKm(null)
        setDriverEtaMin(null)
      }
    })()
  }, [tracking])

  const tokenReady = Boolean(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN)
  const trackingLabel = tracking?.ride_status === 'in_progress' ? 'Arrivée' : 'Chauffeur'

  return (
    <div className="mapbox-wrap">
      <div ref={containerRef} className="mapbox-map" />
      {tracking && tracking.driver_latitude != null && tracking.driver_longitude != null && (
        <div className="live-tracking-badge">
          <strong>🚕 {trackingLabel}</strong>
          <span>{driverDistanceKm == null ? 'Position en direct' : `${driverDistanceKm.toFixed(1)} km`}{driverEtaMin == null ? '' : ` · ${driverEtaMin} min`}</span>
        </div>
      )}
      {!tokenReady && (
        <div className="mapbox-placeholder">
          <strong>Kat reyèl la pare pou aktive</strong>
          <small>Ajoute NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN sou Vercel.</small>
        </div>
      )}
      <style jsx global>{`
        .mapbox-driver-marker{width:42px;height:42px;border-radius:50%;background:#fff;border:3px solid #0f7a62;display:grid;place-items:center;box-shadow:0 8px 22px rgba(16,32,51,.28);font-size:22px}.mapbox-driver-marker span{display:block;line-height:1}.live-tracking-badge{position:absolute;left:14px;top:14px;z-index:8;background:rgba(16,32,51,.92);color:#fff;border-radius:14px;padding:9px 12px;box-shadow:0 8px 22px rgba(16,32,51,.2);font-family:Inter,system-ui,sans-serif;pointer-events:none}.live-tracking-badge strong,.live-tracking-badge span{display:block}.live-tracking-badge strong{font-size:13px}.live-tracking-badge span{font-size:12px;margin-top:2px;color:#dce7ef}
      `}</style>
    </div>
  )
}
