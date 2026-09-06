'use client'

import { useEffect, useRef } from 'react'
import mapboxgl, { GeoJSONSource, LngLatBoundsLike, Map } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

type Point = { lat: number; lng: number }
type RouteGeometry = { type: 'LineString'; coordinates: number[][] }

type Props = {
  pickup: Point | null
  destination: Point | null
  routeGeometry: RouteGeometry | null
}

export default function TaxiMap({ pickup, destination, routeGeometry }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)
  const pickupMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null)

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

  const tokenReady = Boolean(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN)

  return (
    <div className="mapbox-wrap">
      <div ref={containerRef} className="mapbox-map" />
      {!tokenReady && (
        <div className="mapbox-placeholder">
          <strong>Kat reyèl la pare pou aktive</strong>
          <small>Ajoute NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN sou Vercel.</small>
        </div>
      )}
    </div>
  )
}
